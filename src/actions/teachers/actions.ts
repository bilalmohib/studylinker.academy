"use server";

/**
 * Teacher Profile Server Actions
 * Handles teacher profile CRUD operations
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

const createTeacherProfileSchema = z.object({
  userId: idSchema,
  bio: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  timezone: z.string().optional().nullable(),
  languages: z.array(z.string()).optional().nullable(),
  hourlyRate: z.number().positive().optional().nullable(),
  currency: z.string().default("USD"),
  availability: z.record(z.any()).optional().nullable(),
});

const updateTeacherProfileSchema = z.object({
  id: idSchema,
  bio: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  timezone: z.string().optional().nullable(),
  languages: z.array(z.string()).optional().nullable(),
  hourlyRate: z.number().positive().optional().nullable(),
  currency: z.string().optional(),
  availability: z.record(z.any()).optional().nullable(),
});

const searchTeachersSchema = z.object({
  subject: z.string().optional(),
  level: z.string().optional(),
  minRating: z.number().min(0).max(5).optional(),
  verified: z.boolean().optional(),
  location: z.string().optional(),
  maxRate: z.number().positive().optional(),
  ...paginationSchema.shape,
});

/**
 * Create teacher profile
 */
export async function createTeacherProfile(
  data: z.infer<typeof createTeacherProfileSchema>
) {
  try {
    const validated = createTeacherProfileSchema.parse(data);
    const { userId } = await auth();

    if (!userId) {
      throw new UnauthorizedError();
    }

    // Verify user exists and is a teacher
    const supabase = getSupabaseAdmin();
    const { data: user } = await supabase
      .from("UserProfile")
      .select("id, role")
      .eq("clerkId", userId)
      .single();

    if (!user || user.id !== validated.userId) {
      throw new UnauthorizedError();
    }

    const { data: teacher, error } = await supabase
      .from("TeacherProfile")
      .insert({
        id: crypto.randomUUID(),
        ...validated,
        rating: 0,
        totalReviews: 0,
        totalStudents: 0,
        verified: false,
      })
      .select()
      .single();

    if (error) {
      throw new ValidationError(error.message);
    }

    return { success: true, data: teacher };
  } catch (error) {
    return { success: false, ...handleError(error) };
  }
}

/**
 * Get teacher profile by ID
 */
export async function getTeacherProfile(teacherId: string) {
  try {
    const validated = idSchema.parse(teacherId);
    const supabase = getSupabaseAdmin();

    const { data: teacher, error } = await supabase
      .from("TeacherProfile")
      .select(
        `
        *,
        UserProfile:userId (
          id,
          firstName,
          lastName,
          email,
          avatar
        )
      `
      )
      .eq("id", validated)
      .single();

    if (error || !teacher) {
      throw new NotFoundError("Teacher");
    }

    return { success: true, data: teacher };
  } catch (error) {
    return { success: false, ...handleError(error) };
  }
}

/**
 * Get current teacher profile
 */
export async function getCurrentTeacherProfile() {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new UnauthorizedError();
    }

    const supabase = getSupabaseAdmin();

    // Get user profile first
    const { data: user } = await supabase
      .from("UserProfile")
      .select("id")
      .eq("clerkId", userId)
      .single();

    if (!user) {
      throw new NotFoundError("User");
    }

    // Get teacher profile
    const { data: teacher, error } = await supabase
      .from("TeacherProfile")
      .select("*")
      .eq("userId", user.id)
      .single();

    if (error || !teacher) {
      throw new NotFoundError("Teacher profile");
    }

    return { success: true, data: teacher };
  } catch (error) {
    return { success: false, ...handleError(error) };
  }
}

/**
 * Update teacher profile
 */
export async function updateTeacherProfile(
  data: z.infer<typeof updateTeacherProfileSchema>
) {
  try {
    const validated = updateTeacherProfileSchema.parse(data);
    const { userId } = await auth();

    if (!userId) {
      throw new UnauthorizedError();
    }

    const supabase = getSupabaseAdmin();

    // Verify ownership
    const { data: user } = await supabase
      .from("UserProfile")
      .select("id")
      .eq("clerkId", userId)
      .single();

    if (!user) {
      throw new UnauthorizedError();
    }

    const { data: teacher } = await supabase
      .from("TeacherProfile")
      .select("userId")
      .eq("id", validated.id)
      .single();

    if (!teacher || teacher.userId !== user.id) {
      throw new UnauthorizedError();
    }

    const { id, ...updateData } = validated;

    const { data: updatedTeacher, error } = await supabase
      .from("TeacherProfile")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new ValidationError(error.message);
    }

    return { success: true, data: updatedTeacher };
  } catch (error) {
    return { success: false, ...handleError(error) };
  }
}

/**
 * Search teachers with filters
 */
export async function searchTeachers(
  filters: z.infer<typeof searchTeachersSchema>
) {
  try {
    const validated = searchTeachersSchema.parse(filters);
    const supabase = getSupabaseAdmin();

    let query = supabase
      .from("TeacherProfile")
      .select(
        `
        *,
        UserProfile:userId (
          id,
          firstName,
          lastName,
          email,
          avatar
        )
      `,
        { count: "exact" }
      );

    if (validated.minRating !== undefined) {
      query = query.gte("rating", validated.minRating);
    }

    if (validated.verified !== undefined) {
      query = query.eq("verified", validated.verified);
    }

    if (validated.maxRate !== undefined) {
      query = query.lte("hourlyRate", validated.maxRate);
    }

    // Apply pagination
    const page = validated.page || 1;
    const limit = validated.limit || 20;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    query = query.range(from, to).order("rating", { ascending: false });

    const { data: teachers, error, count } = await query;

    if (error) {
      throw new ValidationError(error.message);
    }

    return {
      success: true,
      data: teachers || [],
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

