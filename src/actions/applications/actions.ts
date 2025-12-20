"use server";

/**
 * Application Server Actions
 * Handles job application CRUD operations
 */

import { getSupabaseAdmin } from "@/lib/db/client";
import {
  handleError,
  NotFoundError,
  ValidationError,
  UnauthorizedError,
} from "@/lib/utils/errors";
import {
  idSchema,
  paginationSchema,
  applicationStatusSchema,
} from "@/lib/utils/validation";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";

const createApplicationSchema = z.object({
  jobId: idSchema,
  teacherId: idSchema,
  proposedRate: z.number().positive().optional().nullable(),
  coverLetter: z.string().optional().nullable(),
});

const updateApplicationSchema = z.object({
  id: idSchema,
  proposedRate: z.number().positive().optional().nullable(),
  coverLetter: z.string().optional().nullable(),
  status: applicationStatusSchema.optional(),
});

/**
 * Create a new application
 */
export async function createApplication(
  data: z.infer<typeof createApplicationSchema>
) {
  try {
    const validated = createApplicationSchema.parse(data);
    const { userId } = await auth();

    if (!userId) {
      throw new UnauthorizedError();
    }

    const supabase = getSupabaseAdmin();

    // Verify user is teacher and owns the teacher profile
    const { data: user } = await (supabase
      .from("UserProfile")
      .select("id")
      .eq("clerkId", userId)
      .single() as unknown as Promise<{ data: { id: string } | null; error: any }>);

    if (!user) {
      throw new UnauthorizedError();
    }

    const { data: teacher } = await (supabase
      .from("TeacherProfile")
      .select("userId")
      .eq("id", validated.teacherId)
      .single() as unknown as Promise<{ data: { userId: string } | null; error: any }>);

    if (!teacher || teacher.userId !== user.id) {
      throw new UnauthorizedError();
    }

    // Check if application already exists
    const { data: existing } = await (supabase
      .from("Application")
      .select("id")
      .eq("jobId", validated.jobId)
      .eq("teacherId", validated.teacherId)
      .single() as unknown as Promise<{ data: { id: string } | null; error: any }>);

    if (existing) {
      throw new ValidationError("Application already exists");
    }

    // Check if job is open
    const { data: job } = await (supabase
      .from("JobPosting")
      .select("status")
      .eq("id", validated.jobId)
      .single() as unknown as Promise<{ data: { status: string } | null; error: any }>);

    if (!job || job.status !== "OPEN") {
      throw new ValidationError("Job posting is not open for applications");
    }

    const { data: application, error } = await (supabase
      .from("Application")
      .insert({
        id: crypto.randomUUID(),
        ...validated,
        status: "PENDING",
      } as any)
      .select()
      .single() as unknown as Promise<{ data: any; error: any }>);

    if (error) {
      throw new ValidationError(error.message);
    }

    return { success: true, data: application };
  } catch (error) {
    return { success: false, ...handleError(error) };
  }
}

/**
 * Get application by ID
 */
export async function getApplication(applicationId: string) {
  try {
    const validated = idSchema.parse(applicationId);
    const supabase = getSupabaseAdmin();

    const { data: application, error } = await supabase
      .from("Application")
      .select(
        `
        *,
        JobPosting:jobId (
          id,
          title,
          subject,
          level,
          budget,
          ParentProfile:parentId (
            id,
            UserProfile:userId (
              id,
              firstName,
              lastName,
              email,
              avatar
            )
          )
        ),
        TeacherProfile:teacherId (
          id,
          bio,
          rating,
          verified,
          UserProfile:userId (
            id,
            firstName,
            lastName,
            email,
            avatar
          )
        )
      `
      )
      .eq("id", validated)
      .single();

    if (error || !application) {
      throw new NotFoundError("Application");
    }

    return { success: true, data: application };
  } catch (error) {
    return { success: false, ...handleError(error) };
  }
}

/**
 * Update application (for status changes by parent or teacher)
 */
export async function updateApplication(
  data: z.infer<typeof updateApplicationSchema>
) {
  try {
    const validated = updateApplicationSchema.parse(data);
    const { userId } = await auth();

    if (!userId) {
      throw new UnauthorizedError();
    }

    const supabase = getSupabaseAdmin();

    // Get application and verify ownership
    const { data: application } = await (supabase
      .from("Application")
      .select(
        "id, jobId, teacherId, JobPosting!inner(parentId, ParentProfile!inner(userId, UserProfile!inner(clerkId))), TeacherProfile!inner(userId, UserProfile!inner(clerkId))"
      )
      .eq("id", validated.id)
      .single() as unknown as Promise<{ data: any | null; error: any }>);

    if (!application) {
      throw new NotFoundError("Application");
    }

    const { id, ...updateData } = validated;

    const updateQuery = (supabase
      .from("Application") as any)
      .update(updateData)
      .eq("id", id)
      .select()
      .single();
    
    const { data: updatedApplication, error } = await updateQuery;

    if (error) {
      throw new ValidationError(error.message);
    }

    return { success: true, data: updatedApplication };
  } catch (error) {
    return { success: false, ...handleError(error) };
  }
}

/**
 * Get applications by job
 */
export async function getApplicationsByJob(jobId: string) {
  try {
    const validated = idSchema.parse(jobId);
    const { userId } = await auth();

    if (!userId) {
      throw new UnauthorizedError();
    }

    const supabase = getSupabaseAdmin();

    // Verify user owns the job
    const { data: job } = await (supabase
      .from("JobPosting")
      .select("parentId, ParentProfile!inner(userId, UserProfile!inner(clerkId))")
      .eq("id", validated)
      .single() as unknown as Promise<{ data: any | null; error: any }>);

    if (!job) {
      throw new NotFoundError("Job posting");
    }

    const { data: applications, error } = await supabase
      .from("Application")
      .select(
        `
        *,
        TeacherProfile:teacherId (
          id,
          bio,
          rating,
          verified,
          hourlyRate,
          UserProfile:userId (
            id,
            firstName,
            lastName,
            email,
            avatar
          )
        )
      `
      )
      .eq("jobId", validated)
      .order("createdAt", { ascending: false });

    if (error) {
      throw new ValidationError(error.message);
    }

    return { success: true, data: applications || [] };
  } catch (error) {
    return { success: false, ...handleError(error) };
  }
}

/**
 * Get applications by teacher
 */
export async function getApplicationsByTeacher(teacherId: string) {
  try {
    const validated = idSchema.parse(teacherId);
    const { userId } = await auth();

    if (!userId) {
      throw new UnauthorizedError();
    }

    const supabase = getSupabaseAdmin();

    // Verify user owns the teacher profile
    const { data: teacher } = await (supabase
      .from("TeacherProfile")
      .select("userId, UserProfile!inner(clerkId)")
      .eq("id", validated)
      .single() as unknown as Promise<{ data: { userId: string } | null; error: any }>);

    if (!teacher) {
      throw new NotFoundError("Teacher");
    }

    const { data: applications, error } = await supabase
      .from("Application")
      .select(
        `
        *,
        JobPosting:jobId (
          id,
          title,
          subject,
          level,
          budget,
          status,
          ParentProfile:parentId (
            id,
            UserProfile:userId (
              id,
              firstName,
              lastName,
              email,
              avatar
            )
          )
        )
      `
      )
      .eq("teacherId", validated)
      .order("createdAt", { ascending: false });

    if (error) {
      throw new ValidationError(error.message);
    }

    return { success: true, data: applications || [] };
  } catch (error) {
    return { success: false, ...handleError(error) };
  }
}

