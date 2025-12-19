"use server";

/**
 * Teacher Application Server Actions
 * Handles teacher application CRUD operations and admin review
 */

import { getSupabaseAdmin } from "@/lib/db/client";
import {
  handleError,
  NotFoundError,
  ValidationError,
  UnauthorizedError,
} from "@/lib/utils/errors";
import { idSchema, paginationSchema } from "@/lib/utils/validation";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";

const createTeacherApplicationSchema = z.object({
  userId: idSchema,
  subjects: z.array(z.string()).min(1, "At least one subject is required"),
  levels: z.array(z.string()).min(1, "At least one level is required"),
  qualifications: z.record(z.any()).optional().nullable(),
  experience: z.string().optional().nullable(),
  resume: z.string().url().optional().nullable(),
  certificates: z.array(z.string().url()).optional().nullable(),
  coverLetter: z.string().min(50, "Cover letter must be at least 50 characters"),
});

const updateApplicationStatusSchema = z.object({
  id: idSchema,
  status: z.enum([
    "PENDING",
    "UNDER_REVIEW",
    "INTERVIEW_SCHEDULED",
    "INTERVIEW_COMPLETED",
    "APPROVED",
    "REJECTED",
  ]),
  adminNotes: z.string().optional().nullable(),
  rejectionReason: z.string().optional().nullable(),
});

const scheduleInterviewSchema = z.object({
  id: idSchema,
  interviewScheduledAt: z.string().datetime(),
  interviewLink: z.string().url(),
  interviewNotes: z.string().optional().nullable(),
});

const scoreInterviewSchema = z.object({
  id: idSchema,
  interviewScore: z.number().min(0).max(100),
  maxInterviewScore: z.number().positive().default(100),
  interviewNotes: z.string().optional().nullable(),
});

/**
 * Create a new teacher application
 */
export async function createTeacherApplication(
  data: z.infer<typeof createTeacherApplicationSchema>
) {
  try {
    const validated = createTeacherApplicationSchema.parse(data);
    const { userId } = await auth();

    if (!userId) {
      throw new UnauthorizedError();
    }

    const supabase = getSupabaseAdmin();

    // Verify user exists and matches
    const { data: user } = await supabase
      .from("UserProfile")
      .select("id, clerkId, role")
      .eq("clerkId", userId)
      .single();

    if (!user) {
      throw new UnauthorizedError();
    }

    if (user.id !== validated.userId) {
      throw new UnauthorizedError();
    }

    // Check if user already has an application
    const { data: existing } = await supabase
      .from("TeacherApplication")
      .select("id, status")
      .eq("userId", validated.userId)
      .single();

    if (existing) {
      if (existing.status === "APPROVED") {
        throw new ValidationError("You are already approved as a teacher");
      }
      if (existing.status === "PENDING" || existing.status === "UNDER_REVIEW") {
        throw new ValidationError("You already have a pending application");
      }
    }

    const { data: application, error } = await supabase
      .from("TeacherApplication")
      .insert({
        id: crypto.randomUUID(),
        ...validated,
        status: "PENDING",
      })
      .select()
      .single();

    if (error) {
      throw new ValidationError(error.message);
    }

    return { success: true, data: application };
  } catch (error) {
    return { success: false, ...handleError(error) };
  }
}

/**
 * Get teacher application by ID
 */
export async function getTeacherApplication(applicationId: string) {
  try {
    const validated = idSchema.parse(applicationId);
    const { userId } = await auth();

    if (!userId) {
      throw new UnauthorizedError();
    }

    const supabase = getSupabaseAdmin();

    const { data: application, error } = await supabase
      .from("TeacherApplication")
      .select(
        `
        *,
        UserProfile:userId (
          id,
          firstName,
          lastName,
          email,
          avatar,
          role
        ),
        Reviewer:reviewedBy (
          id,
          firstName,
          lastName,
          email
        )
      `
      )
      .eq("id", validated)
      .single();

    if (error || !application) {
      throw new NotFoundError("Teacher application");
    }

    // Verify user owns the application or is admin
    const { data: user } = await supabase
      .from("UserProfile")
      .select("id, role")
      .eq("clerkId", userId)
      .single();

    if (!user) {
      throw new UnauthorizedError();
    }

    if (application.userId !== user.id && user.role !== "ADMIN" && user.role !== "MANAGER") {
      throw new UnauthorizedError();
    }

    return { success: true, data: application };
  } catch (error) {
    return { success: false, ...handleError(error) };
  }
}

/**
 * Get current user's teacher application
 */
export async function getCurrentTeacherApplication() {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new UnauthorizedError();
    }

    const supabase = getSupabaseAdmin();

    const { data: user } = await supabase
      .from("UserProfile")
      .select("id")
      .eq("clerkId", userId)
      .single();

    if (!user) {
      throw new NotFoundError("User");
    }

    const { data: application, error } = await supabase
      .from("TeacherApplication")
      .select("*")
      .eq("userId", user.id)
      .order("createdAt", { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No application found
        return { success: true, data: null };
      }
      throw new ValidationError(error.message);
    }

    return { success: true, data: application };
  } catch (error) {
    return { success: false, ...handleError(error) };
  }
}

/**
 * Get all teacher applications (admin only)
 */
export async function getAllTeacherApplications(
  filters?: {
    status?: string;
    page?: number;
    limit?: number;
  }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new UnauthorizedError();
    }

    const supabase = getSupabaseAdmin();

    // Verify user is admin or manager
    const { data: user } = await supabase
      .from("UserProfile")
      .select("role")
      .eq("clerkId", userId)
      .single();

    if (!user || (user.role !== "ADMIN" && user.role !== "MANAGER")) {
      throw new UnauthorizedError("Admin access required");
    }

    let query = supabase
      .from("TeacherApplication")
      .select(
        `
        *,
        UserProfile:userId (
          id,
          firstName,
          lastName,
          email,
          avatar
        ),
        Reviewer:reviewedBy (
          id,
          firstName,
          lastName,
          email
        )
      `,
        { count: "exact" }
      )
      .order("createdAt", { ascending: false });

    if (filters?.status) {
      query = query.eq("status", filters.status);
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    query = query.range(from, to);

    const { data: applications, error, count } = await query;

    if (error) {
      throw new ValidationError(error.message);
    }

    return {
      success: true,
      data: applications || [],
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
 * Update application status (admin only)
 */
export async function updateApplicationStatus(
  data: z.infer<typeof updateApplicationStatusSchema>
) {
  try {
    const validated = updateApplicationStatusSchema.parse(data);
    const { userId } = await auth();

    if (!userId) {
      throw new UnauthorizedError();
    }

    const supabase = getSupabaseAdmin();

    // Verify user is admin or manager
    const { data: user } = await supabase
      .from("UserProfile")
      .select("id, role")
      .eq("clerkId", userId)
      .single();

    if (!user || (user.role !== "ADMIN" && user.role !== "MANAGER")) {
      throw new UnauthorizedError("Admin access required");
    }

    const updateData: any = {
      status: validated.status,
      reviewedBy: user.id,
      reviewedAt: new Date().toISOString(),
    };

    if (validated.adminNotes) {
      updateData.adminNotes = validated.adminNotes;
    }

    if (validated.status === "REJECTED" && validated.rejectionReason) {
      updateData.rejectionReason = validated.rejectionReason;
    }

    // If approved, create teacher profile
    if (validated.status === "APPROVED") {
      const { data: application } = await supabase
        .from("TeacherApplication")
        .select("userId")
        .eq("id", validated.id)
        .single();

      if (application) {
        // Check if teacher profile already exists
        const { data: existingProfile } = await supabase
          .from("TeacherProfile")
          .select("id")
          .eq("userId", application.userId)
          .single();

        if (!existingProfile) {
          // Create teacher profile
          await supabase.from("TeacherProfile").insert({
            id: crypto.randomUUID(),
            userId: application.userId,
            verified: true,
          });
        } else {
          // Update existing profile to verified
          await supabase
            .from("TeacherProfile")
            .update({ verified: true })
            .eq("id", existingProfile.id);
        }
      }
    }

    const { data: application, error } = await supabase
      .from("TeacherApplication")
      .update(updateData)
      .eq("id", validated.id)
      .select()
      .single();

    if (error) {
      throw new ValidationError(error.message);
    }

    return { success: true, data: application };
  } catch (error) {
    return { success: false, ...handleError(error) };
  }
}

/**
 * Schedule interview (admin only)
 */
export async function scheduleInterview(
  data: z.infer<typeof scheduleInterviewSchema>
) {
  try {
    const validated = scheduleInterviewSchema.parse(data);
    const { userId } = await auth();

    if (!userId) {
      throw new UnauthorizedError();
    }

    const supabase = getSupabaseAdmin();

    // Verify user is admin or manager
    const { data: user } = await supabase
      .from("UserProfile")
      .select("id, role")
      .eq("clerkId", userId)
      .single();

    if (!user || (user.role !== "ADMIN" && user.role !== "MANAGER")) {
      throw new UnauthorizedError("Admin access required");
    }

    const { data: application, error } = await supabase
      .from("TeacherApplication")
      .update({
        status: "INTERVIEW_SCHEDULED",
        interviewScheduledAt: validated.interviewScheduledAt,
        interviewLink: validated.interviewLink,
        interviewNotes: validated.interviewNotes || null,
        reviewedBy: user.id,
        reviewedAt: new Date().toISOString(),
      })
      .eq("id", validated.id)
      .select()
      .single();

    if (error) {
      throw new ValidationError(error.message);
    }

    return { success: true, data: application };
  } catch (error) {
    return { success: false, ...handleError(error) };
  }
}

/**
 * Score interview (admin only)
 */
export async function scoreInterview(
  data: z.infer<typeof scoreInterviewSchema>
) {
  try {
    const validated = scoreInterviewSchema.parse(data);
    const { userId } = await auth();

    if (!userId) {
      throw new UnauthorizedError();
    }

    const supabase = getSupabaseAdmin();

    // Verify user is admin or manager
    const { data: user } = await supabase
      .from("UserProfile")
      .select("id, role")
      .eq("clerkId", userId)
      .single();

    if (!user || (user.role !== "ADMIN" && user.role !== "MANAGER")) {
      throw new UnauthorizedError("Admin access required");
    }

    const { data: application, error } = await supabase
      .from("TeacherApplication")
      .update({
        status: "INTERVIEW_COMPLETED",
        interviewScore: validated.interviewScore,
        maxInterviewScore: validated.maxInterviewScore,
        interviewNotes: validated.interviewNotes || null,
        reviewedBy: user.id,
        reviewedAt: new Date().toISOString(),
      })
      .eq("id", validated.id)
      .select()
      .single();

    if (error) {
      throw new ValidationError(error.message);
    }

    return { success: true, data: application };
  } catch (error) {
    return { success: false, ...handleError(error) };
  }
}

