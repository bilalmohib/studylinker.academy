import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createUserProfile } from "@/actions/users/actions";
import { createParentProfile } from "@/actions/parents/actions";
import { createTeacherProfile } from "@/actions/teachers/actions";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { role, firstName, lastName, email } = body;

    if (!role || (role !== "PARENT" && role !== "TEACHER")) {
      return NextResponse.json(
        { error: "Invalid role. Must be PARENT or TEACHER" },
        { status: 400 }
      );
    }

    // Get Clerk user data
    const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Create user profile
    const userProfileResult = await createUserProfile({
      clerkId: userId,
      email: email || user.emailAddresses[0]?.emailAddress || "",
      firstName: firstName || user.firstName || "",
      lastName: lastName || user.lastName || "",
      role: role,
      avatar: user.imageUrl || undefined,
    });

    if (!userProfileResult.success) {
      const errorMessage = "error" in userProfileResult 
        ? userProfileResult.error 
        : "Failed to create user profile";
      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      );
    }

    // Type guard: check if result has data property
    if (!("data" in userProfileResult)) {
      return NextResponse.json(
        { error: "Failed to create user profile - no data returned" },
        { status: 500 }
      );
    }

    // At this point, TypeScript knows data exists
    const userProfileId = (userProfileResult as { success: true; data: { id: string } }).data.id;

    // Create role-specific profile
    if (role === "PARENT") {
      const parentResult = await createParentProfile(userProfileId);

      if (!parentResult.success) {
        const errorMessage = "error" in parentResult 
          ? parentResult.error 
          : "Failed to create parent profile";
        return NextResponse.json(
          { error: errorMessage },
          { status: 500 }
        );
      }
      // Parent profile created successfully
    } else if (role === "TEACHER") {
      const teacherResult = await createTeacherProfile({
        userId: userProfileId,
        currency: "USD",
      });

      if (!teacherResult.success) {
        const errorMessage = "error" in teacherResult 
          ? teacherResult.error 
          : "Failed to create teacher profile";
        return NextResponse.json(
          { error: errorMessage },
          { status: 500 }
        );
      }
      // Teacher profile created successfully
    }

    return NextResponse.json({ 
      success: true,
      role,
      message: `${role} profile created successfully` 
    });
  } catch (error) {
    console.error("Error creating user profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

