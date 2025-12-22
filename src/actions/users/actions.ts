"use server";

/**
 * User Profile Server Actions
 * Handles user profile CRUD operations
 */

import { getSupabaseAdmin } from "@/lib/db/client";
import { handleError, NotFoundError, ValidationError, UnauthorizedError } from "@/lib/utils/errors";
import { idSchema, emailSchema, userRoleSchema, paginationSchema } from "@/lib/utils/validation";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";

const createUserSchema = z.object({
  clerkId: z.string().min(1, "Clerk ID is required"),
  email: emailSchema,
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  avatar: z.string().url().optional().nullable().or(z.literal("").transform(() => null)),
  role: userRoleSchema.default("PARENT"),
});

const updateUserSchema = z.object({
  id: idSchema,
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  avatar: z.string().url().optional().nullable(),
  role: userRoleSchema.optional(),
});

/**
 * Create a new user profile
 */
export async function createUserProfile(data: z.infer<typeof createUserSchema>) {
  try {
    // Pre-process data to handle edge cases
    const processedData = {
      ...data,
      avatar: data.avatar && data.avatar.trim() !== "" ? data.avatar : null,
      firstName: data.firstName && data.firstName.trim() !== "" ? data.firstName : null,
      lastName: data.lastName && data.lastName.trim() !== "" ? data.lastName : null,
    };

    let validated: z.infer<typeof createUserSchema>;
    try {
      validated = createUserSchema.parse(processedData);
    } catch (validationError) {
      console.error("Validation error in createUserProfile:", validationError);
      return {
        success: false,
        error: "Invalid user profile data",
        code: "VALIDATION_ERROR"
      };
    }
    
    const supabase = getSupabaseAdmin();
    console.log("createUserProfile: Checking for existing user with clerkId:", validated.clerkId);

    // Check if user already exists
    const { data: existingUser, error: checkError } = await (supabase
      .from("UserProfile")
      .select("id")
      .eq("clerkId", validated.clerkId)
      .maybeSingle() as unknown as Promise<{ data: any | null; error: any }>);

    if (checkError && checkError.code !== "PGRST116") {
      console.error("Error checking for existing user:", checkError);
      return {
        success: false,
        error: "Failed to check existing user profile",
        code: "DATABASE_ERROR"
      };
    }

    // If user exists, return it
    if (existingUser) {
      console.log("createUserProfile: User already exists:", existingUser.id);
      return { 
        success: true, 
        data: {
          id: existingUser.id,
          clerkId: validated.clerkId,
          email: validated.email,
          role: existingUser.role || validated.role
        }
      };
    }

    // Generate UUID using Node.js crypto
    const crypto = await import("crypto");
    const userId = crypto.randomUUID();
    console.log("createUserProfile: Creating new user with id:", userId);

    const insertData: any = {
      id: userId,
      clerkId: validated.clerkId,
      email: validated.email,
      firstName: validated.firstName || null,
      lastName: validated.lastName || null,
      avatar: validated.avatar || null,
      role: validated.role,
    };

    const { data: user, error: insertError } = await (supabase
      .from("UserProfile")
      .insert(insertData as any)
      .select()
      .maybeSingle() as unknown as Promise<{ data: any; error: any }>);

    if (insertError) {
      console.error("Supabase error creating user profile:", insertError);
      return {
        success: false,
        error: insertError.message || "Failed to create user profile",
        code: "DATABASE_ERROR"
      };
    }

    if (!user) {
      console.error("User profile creation returned no data");
      return {
        success: false,
        error: "Failed to create user profile",
        code: "DATABASE_ERROR"
      };
    }

    console.log("createUserProfile: User created successfully:", user.id);
    // Return only plain serializable data
    return { 
      success: true, 
      data: {
        id: user.id,
        clerkId: user.clerkId,
        email: user.email,
        role: user.role
      }
    };
  } catch (error) {
    console.error("Error in createUserProfile:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    return {
      success: false,
      error: errorMessage,
      code: "UNKNOWN_ERROR"
    };
  }
}

/**
 * Get user profile by ID
 */
export async function getUserProfile(userId: string) {
  try {
    const validated = idSchema.parse(userId);
    const supabase = getSupabaseAdmin();

    const { data: user, error } = await supabase
      .from("UserProfile")
      .select("*")
      .eq("id", validated)
      .single();

    if (error || !user) {
      throw new NotFoundError("User");
    }

    return { success: true, data: user };
  } catch (error) {
    return { success: false, ...handleError(error) };
  }
}

/**
 * Get user profile by Clerk ID
 */
export async function getUserProfileByClerkId(clerkId: string) {
  try {
    const validated = z.string().min(1).parse(clerkId);
    const supabase = getSupabaseAdmin();

    const { data: user, error } = await (supabase
      .from("UserProfile")
      .select("*")
      .eq("clerkId", validated)
      .maybeSingle() as unknown as Promise<{ data: any | null; error: any }>);

    // Handle database errors (not "not found")
    if (error && error.code !== "PGRST116") {
      console.error("Error fetching user by clerkId:", error);
      return {
        success: false,
        error: "Failed to fetch user profile",
        code: "DATABASE_ERROR"
      };
    }

    // User not found is OK - return null
    if (!user) {
      return { success: true, data: null };
    }

    return { success: true, data: user };
  } catch (error) {
    console.error("Unexpected error in getUserProfileByClerkId:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    return {
      success: false,
      error: errorMessage,
      code: "UNKNOWN_ERROR"
    };
  }
}

/**
 * Get current authenticated user profile
 */
export async function getCurrentUserProfile() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: true, data: null };
    }

    return await getUserProfileByClerkId(userId);
  } catch (error) {
    console.error("Error in getCurrentUserProfile:", error);
    // Return success with null data if user not found (not an error state)
    return { success: true, data: null };
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  data: z.infer<typeof updateUserSchema>
) {
  try {
    const validated = updateUserSchema.parse(data);
    const { userId } = await auth();

    if (!userId) {
      throw new NotFoundError("User");
    }

    // Verify user owns this profile
    const currentUser = await getUserProfileByClerkId(userId);
    if (!currentUser.success || !("data" in currentUser)) {
      throw new NotFoundError("User");
    }
    const userData = currentUser.data as { id: string } | undefined;
    if (!userData || userData.id !== validated.id) {
      throw new NotFoundError("User");
    }

    const supabase = getSupabaseAdmin();
    const { id, ...updateData } = validated;

    const updatePayload: Record<string, any> = {};
    if (updateData.firstName !== undefined) updatePayload.firstName = updateData.firstName;
    if (updateData.lastName !== undefined) updatePayload.lastName = updateData.lastName;
    if (updateData.avatar !== undefined) updatePayload.avatar = updateData.avatar;
    if (updateData.role !== undefined) updatePayload.role = updateData.role;

    const updateQuery = (supabase
      .from("UserProfile") as any)
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();
    
    const { data: user, error } = await updateQuery;

    if (error) {
      throw new ValidationError(error.message);
    }

    return { success: true, data: user };
  } catch (error) {
    return { success: false, ...handleError(error) };
  }
}

/**
 * Delete user profile
 */
export async function deleteUserProfile(userId: string) {
  try {
    const validated = idSchema.parse(userId);
    const { userId: currentUserId } = await auth();

    if (!currentUserId) {
      throw new NotFoundError("User");
    }

    // Verify user owns this profile
    const currentUser = await getUserProfileByClerkId(currentUserId);
    if (!currentUser.success || !("data" in currentUser)) {
      throw new NotFoundError("User");
    }
    const userData = currentUser.data as { id: string } | undefined;
    if (!userData || userData.id !== validated) {
      throw new NotFoundError("User");
    }

    const supabase = getSupabaseAdmin();

    const { error } = await supabase
      .from("UserProfile")
      .delete()
      .eq("id", validated);

    if (error) {
      throw new ValidationError(error.message);
    }

    return { success: true };
  } catch (error) {
    return { success: false, ...handleError(error) };
  }
}

const getAllUsersSchema = z.object({
  role: userRoleSchema.optional(),
  search: z.string().optional(),
  ...paginationSchema.shape,
});

/**
 * Get all users (admin only)
 */
export async function getAllUsers(filters?: z.infer<typeof getAllUsersSchema>) {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new UnauthorizedError();
    }

    // Check if user is admin
    const supabase = getSupabaseAdmin();
    const { data: currentUser } = await supabase
      .from("UserProfile")
      .select("isAdmin")
      .eq("clerkId", userId)
      .single();

    if (!currentUser || !(currentUser as { isAdmin: boolean }).isAdmin) {
      throw new UnauthorizedError("Admin access required");
    }

    const validated = filters ? getAllUsersSchema.parse(filters) : { page: 1, limit: 20 };
    const page = validated.page || 1;
    const limit = validated.limit || 20;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from("UserProfile")
      .select("*", { count: "exact" })
      .order("createdAt", { ascending: false });

    if (validated.role) {
      query = query.eq("role", validated.role);
    }

    if (validated.search) {
      query = query.or(
        `firstName.ilike.%${validated.search}%,lastName.ilike.%${validated.search}%,email.ilike.%${validated.search}%`
      );
    }

    query = query.range(from, to);

    const { data: users, error, count } = await query;

    if (error) {
      throw new ValidationError(error.message);
    }

    // Fetch teacher profiles for teachers to get verification status
    const teacherUserIds = (users || [])
      .filter((user: any) => user.role === "TEACHER")
      .map((user: any) => user.id);

    let teacherProfiles: any[] = [];
    if (teacherUserIds.length > 0) {
      const { data: teachers } = await supabase
        .from("TeacherProfile")
        .select("userId, verified")
        .in("userId", teacherUserIds);
      
      teacherProfiles = teachers || [];
    }

    // Merge teacher verification status with users
    const usersWithVerification = (users || []).map((user: any) => {
      if (user.role === "TEACHER") {
        const teacherProfile = teacherProfiles.find((tp: any) => tp.userId === user.id);
        return {
          ...user,
          TeacherProfile: teacherProfile ? { verified: teacherProfile.verified } : null,
        };
      }
      return user;
    });

    return {
      success: true,
      data: usersWithVerification,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    };
  } catch (error) {
    return { success: false, ...handleError(error) };
  }
}

/**
 * Update user profile (admin)
 */
export async function updateUserProfileAdmin(
  data: z.infer<typeof updateUserSchema> & { isAdmin?: boolean }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new UnauthorizedError();
    }

    // Check if user is admin
    const supabase = getSupabaseAdmin();
    const { data: currentUser } = await (supabase
      .from("UserProfile")
      .select("isAdmin")
      .eq("clerkId", userId)
      .single() as unknown as Promise<{ data: { isAdmin: boolean } | null; error: any }>);

    if (!currentUser || !currentUser.isAdmin) {
      throw new UnauthorizedError("Admin access required");
    }

    const validated = updateUserSchema.parse(data);
    const updateData: Record<string, any> = {};

    if (validated.firstName !== undefined) {
      updateData.firstName = validated.firstName;
    }
    if (validated.lastName !== undefined) {
      updateData.lastName = validated.lastName;
    }
    if (validated.avatar !== undefined) {
      updateData.avatar = validated.avatar;
    }
    if (validated.role !== undefined) {
      updateData.role = validated.role;
    }
    if (data.isAdmin !== undefined) {
      updateData.isAdmin = data.isAdmin;
    }

    updateData.updatedAt = new Date().toISOString();

    const updateQuery = (supabase
      .from("UserProfile") as any)
      .update(updateData)
      .eq("id", validated.id)
      .select()
      .single();
    
    const { data: user, error } = await updateQuery;

    if (error) {
      throw new ValidationError(error.message);
    }

    return { success: true, data: user };
  } catch (error) {
    return { success: false, ...handleError(error) };
  }
}

/**
 * Delete user profile (admin only)
 */
export async function deleteUserProfileAdmin(userId: string) {
  try {
    const validated = idSchema.parse(userId);
    const { userId: currentUserId } = await auth();

    if (!currentUserId) {
      throw new UnauthorizedError();
    }

    // Check if user is admin
    const supabase = getSupabaseAdmin();
    const { data: currentUser } = await (supabase
      .from("UserProfile")
      .select("isAdmin")
      .eq("clerkId", currentUserId)
      .single() as unknown as Promise<{ data: { isAdmin: boolean } | null; error: any }>);

    if (!currentUser || !currentUser.isAdmin) {
      throw new UnauthorizedError("Admin access required");
    }

    // Prevent admin from deleting themselves
    const { data: targetUser } = await (supabase
      .from("UserProfile")
      .select("id, clerkId")
      .eq("id", validated)
      .single() as unknown as Promise<{ data: { clerkId: string } | null; error: any }>);

    if (!targetUser) {
      throw new NotFoundError("User");
    }

    if (targetUser.clerkId === currentUserId) {
      throw new ValidationError("You cannot delete your own account");
    }

    // Delete related records first (cascade delete)
    console.log("Deleting related records for user:", validated);
    
    // Delete ParentProfile if exists
    const { error: parentError } = await supabase
      .from("ParentProfile")
      .delete()
      .eq("userId", validated);
    
    if (parentError) {
      console.warn("Error deleting parent profile:", parentError);
    }
    
    // Delete TeacherProfile if exists
    const { error: teacherError } = await supabase
      .from("TeacherProfile")
      .delete()
      .eq("userId", validated);
    
    if (teacherError) {
      console.warn("Error deleting teacher profile:", teacherError);
    }
    
    // Now delete the UserProfile
    const { error } = await supabase
      .from("UserProfile")
      .delete()
      .eq("id", validated);

    if (error) {
      console.error("Error deleting user profile:", error);
      throw new ValidationError(error.message);
    }

    console.log("User deleted successfully:", validated);
    return { success: true };
  } catch (error) {
    console.error("Error in deleteUserProfileAdmin:", error);
    return { success: false, ...handleError(error) };
  }
}

