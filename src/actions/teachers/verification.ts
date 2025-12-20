"use server";

/**
 * Teacher Verification Utilities
 * Checks teacher application status and verification
 */

import { getSupabaseAdmin } from "@/lib/db/client";
import { auth } from "@clerk/nextjs/server";
import { getCurrentTeacherApplication } from "@/actions/teacher-applications/actions";

export interface TeacherVerificationStatus {
  isVerified: boolean;
  hasApplication: boolean;
  applicationStatus: "PENDING" | "UNDER_REVIEW" | "INTERVIEW_SCHEDULED" | "INTERVIEW_COMPLETED" | "APPROVED" | "REJECTED" | null;
  applicationId: string | null;
}

/**
 * Check teacher verification and application status
 */
export async function checkTeacherVerification(): Promise<{
  success: boolean;
  data?: TeacherVerificationStatus;
  error?: string;
}> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: "Not authenticated" };
    }

    const supabase = getSupabaseAdmin();

    // Get user profile
    const { data: userProfile, error: userError } = await (supabase
      .from("UserProfile")
      .select("id, role")
      .eq("clerkId", userId)
      .single() as unknown as Promise<{ data: { id: string; role: string } | null; error: any }>);

    if (userError || !userProfile) {
      return { success: false, error: "User profile not found" };
    }

    // Check if user is a teacher
    if (userProfile.role !== "TEACHER") {
      return { success: false, error: "User is not a teacher" };
    }

    // Get teacher profile
    const { data: teacherProfile, error: teacherError } = await (supabase
      .from("TeacherProfile")
      .select("id, verified")
      .eq("userId", userProfile.id)
      .single() as unknown as Promise<{ data: { id: string; verified?: boolean } | null; error: any }>);

    if (teacherError || !teacherProfile) {
      // Teacher profile doesn't exist, check if application exists
      const applicationResult = await getCurrentTeacherApplication();
      const hasApplication = applicationResult.success && applicationResult.data !== null;
      const application = applicationResult.success && applicationResult.data
        ? (applicationResult.data as { status: string; id: string })
        : null;

      return {
        success: true,
        data: {
          isVerified: false,
          hasApplication,
          applicationStatus: application?.status as TeacherVerificationStatus["applicationStatus"] || null,
          applicationId: application?.id || null,
        },
      };
    }

    const isVerified = (teacherProfile as { verified?: boolean }).verified === true;

    // If verified, return early
    if (isVerified) {
      return {
        success: true,
        data: {
          isVerified: true,
          hasApplication: true,
          applicationStatus: "APPROVED",
          applicationId: null,
        },
      };
    }

    // Not verified, check application status
    const applicationResult = await getCurrentTeacherApplication();
    const hasApplication = applicationResult.success && applicationResult.data !== null;
    const application = applicationResult.success && applicationResult.data
      ? (applicationResult.data as { status: string; id: string })
      : null;

    return {
      success: true,
      data: {
        isVerified: false,
        hasApplication,
        applicationStatus: application?.status as TeacherVerificationStatus["applicationStatus"] || null,
        applicationId: application?.id || null,
      },
    };
  } catch (error) {
    console.error("Error checking teacher verification:", error);
    return { success: false, error: "An error occurred" };
  }
}

