"use server";

/**
 * Job Posting Server Actions
 * Handles job posting CRUD operations
 */

import { getSupabaseAdmin } from "@/lib/db/client";
import {
  handleError,
  NotFoundError,
  ValidationError,
  UnauthorizedError,
} from "@/lib/utils/errors";
import { idSchema, paginationSchema, jobStatusSchema } from "@/lib/utils/validation";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";

const createJobSchema = z.object({
  parentId: idSchema,
  title: z.string().min(1, "Title is required"),
  subject: z.string().min(1, "Subject is required"),
  level: z.string().min(1, "Level is required"),
  studentAge: z.number().int().min(3).max(25).optional().nullable(),
  hoursPerWeek: z.string().min(1, "Hours per week is required"),
  budget: z.string().min(1, "Budget is required"),
  description: z.string().min(1, "Description is required"),
  requirements: z.array(z.string()).optional().nullable(),
  curriculum: z.boolean().default(false),
  applicationMode: z.enum(["OPEN", "CURATED"]).default("OPEN"),
});

const updateJobSchema = z.object({
  id: idSchema,
  title: z.string().min(1).optional(),
  subject: z.string().min(1).optional(),
  level: z.string().min(1).optional(),
  studentAge: z.number().int().min(3).max(25).optional().nullable(),
  hoursPerWeek: z.string().optional(),
  budget: z.string().optional(),
  description: z.string().optional(),
  requirements: z.array(z.string()).optional().nullable(),
  curriculum: z.boolean().optional(),
  applicationMode: z.enum(["OPEN", "CURATED"]).optional(),
  status: jobStatusSchema.optional(),
});

const searchJobsSchema = z.object({
  subject: z.string().optional(),
  level: z.string().optional(),
  status: jobStatusSchema.optional(),
  parentId: idSchema.optional(),
  ...paginationSchema.shape,
});

/**
 * Create a new job posting
 */
export async function createJobPosting(
  data: z.infer<typeof createJobSchema>
) {
  try {
    const validated = createJobSchema.parse(data);
    const { userId } = await auth();

    if (!userId) {
      throw new UnauthorizedError();
    }

    const supabase = getSupabaseAdmin();

    // Verify user is parent and owns the parent profile
    const { data: user } = await supabase
      .from("UserProfile")
      .select("id")
      .eq("clerkId", userId)
      .single();

    if (!user) {
      throw new UnauthorizedError();
    }

    const { data: parent } = await supabase
      .from("ParentProfile")
      .select("userId")
      .eq("id", validated.parentId)
      .single();

    if (!parent || parent.userId !== user.id) {
      throw new UnauthorizedError();
    }

    const { data: job, error } = await supabase
      .from("JobPosting")
      .insert({
        id: crypto.randomUUID(),
        ...validated,
        status: "OPEN",
      })
      .select()
      .single();

    if (error) {
      throw new ValidationError(error.message);
    }

    return { success: true, data: job };
  } catch (error) {
    return { success: false, ...handleError(error) };
  }
}

/**
 * Get job posting by ID
 */
export async function getJobPosting(jobId: string) {
  try {
    const validated = idSchema.parse(jobId);
    const supabase = getSupabaseAdmin();

    const { data: job, error } = await supabase
      .from("JobPosting")
      .select(
        `
        *,
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
      `
      )
      .eq("id", validated)
      .single();

    if (error || !job) {
      throw new NotFoundError("Job posting");
    }

    return { success: true, data: job };
  } catch (error) {
    return { success: false, ...handleError(error) };
  }
}

/**
 * Update job posting
 */
export async function updateJobPosting(
  data: z.infer<typeof updateJobSchema>
) {
  try {
    const validated = updateJobSchema.parse(data);
    const { userId } = await auth();

    if (!userId) {
      throw new UnauthorizedError();
    }

    const supabase = getSupabaseAdmin();

    // Get job and verify ownership
    const { data: job } = await supabase
      .from("JobPosting")
      .select("parentId, ParentProfile!inner(userId, UserProfile!inner(clerkId))")
      .eq("id", validated.id)
      .single();

    if (!job) {
      throw new NotFoundError("Job posting");
    }

    const { id, ...updateData } = validated;

    const { data: updatedJob, error } = await supabase
      .from("JobPosting")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new ValidationError(error.message);
    }

    return { success: true, data: updatedJob };
  } catch (error) {
    return { success: false, ...handleError(error) };
  }
}

/**
 * Delete job posting
 */
export async function deleteJobPosting(jobId: string) {
  try {
    const validated = idSchema.parse(jobId);
    const { userId } = await auth();

    if (!userId) {
      throw new UnauthorizedError();
    }

    const supabase = getSupabaseAdmin();

    // Verify ownership
    const { data: job } = await supabase
      .from("JobPosting")
      .select("parentId, ParentProfile!inner(userId, UserProfile!inner(clerkId))")
      .eq("id", validated)
      .single();

    if (!job) {
      throw new NotFoundError("Job posting");
    }

    const { error } = await supabase
      .from("JobPosting")
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

/**
 * Search job postings
 */
export async function searchJobPostings(
  filters: z.infer<typeof searchJobsSchema>
) {
  try {
    const validated = searchJobsSchema.parse(filters);
    const supabase = getSupabaseAdmin();

    let query = supabase
      .from("JobPosting")
      .select(
        `
        *,
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
      `,
        { count: "exact" }
      );

    if (validated.subject) {
      query = query.eq("subject", validated.subject);
    }

    if (validated.level) {
      query = query.eq("level", validated.level);
    }

    if (validated.status) {
      query = query.eq("status", validated.status);
    }

    if (validated.parentId) {
      query = query.eq("parentId", validated.parentId);
    }

    // Apply pagination
    const page = validated.page || 1;
    const limit = validated.limit || 20;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    query = query.range(from, to).order("createdAt", { ascending: false });

    const { data: jobs, error, count } = await query;

    if (error) {
      throw new ValidationError(error.message);
    }

    return {
      success: true,
      data: jobs || [],
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
 * Get job postings by parent
 */
export async function getJobPostingsByParent(parentId: string) {
  try {
    const validated = idSchema.parse(parentId);
    const supabase = getSupabaseAdmin();

    const { data: jobs, error } = await supabase
      .from("JobPosting")
      .select("*")
      .eq("parentId", validated)
      .order("createdAt", { ascending: false });

    if (error) {
      throw new ValidationError(error.message);
    }

    return { success: true, data: jobs || [] };
  } catch (error) {
    return { success: false, ...handleError(error) };
  }
}

