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
import { randomUUID } from "crypto";

const createTeacherProfileSchema = z.object({
  userId: idSchema,
  bio: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  timezone: z.string().optional().nullable(),
  languages: z.array(z.string()).optional().nullable(),
  hourlyRate: z.number().positive().optional().nullable(),
  currency: z.string().optional().default("USD"),
  availability: z.record(z.string(), z.any()).optional().nullable(),
});

const updateTeacherProfileSchema = z.object({
  id: idSchema,
  bio: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  timezone: z.string().optional().nullable(),
  languages: z.array(z.string()).optional().nullable(),
  hourlyRate: z.number().positive().optional().nullable(),
  currency: z.string().optional(),
  availability: z.record(z.string(), z.any()).optional().nullable(),
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
  console.log("createTeacherProfile called with data:", data);
  
  try {
    // Validate input
    let validated: z.infer<typeof createTeacherProfileSchema>;
    try {
      validated = createTeacherProfileSchema.parse(data);
    } catch (validationError) {
      console.error("Validation error:", validationError);
      return {
        success: false,
        error: "Invalid teacher profile data",
        code: "VALIDATION_ERROR"
      };
    }
    
    // Get current authenticated user
    let userId: string | null;
    try {
      const authResult = await auth();
      userId = authResult.userId;
      console.log("Current clerkUserId:", userId);
    } catch (authError) {
      console.error("Auth error:", authError);
      return {
        success: false,
        error: "Authentication failed",
        code: "AUTH_ERROR"
      };
    }

    if (!userId) {
      console.error("No authenticated user");
      return { 
        success: false, 
        error: "You must be signed in to create a profile",
        code: "UNAUTHORIZED" 
      };
    }

    // Verify user exists and is a teacher
    const supabase = getSupabaseAdmin();
    const { data: user, error: userError } = await (supabase
      .from("UserProfile")
      .select("id, role")
      .eq("clerkId", userId)
      .maybeSingle() as unknown as Promise<{ data: { id: string; role: string } | null; error: any }>);

    if (userError) {
      console.error("Error fetching user:", userError);
      return { 
        success: false, 
        error: "Failed to verify user profile",
        code: "DATABASE_ERROR" 
      };
    }

    if (!user) {
      console.error("User not found for clerkId:", userId);
      return { 
        success: false, 
        error: "User profile not found",
        code: "NOT_FOUND" 
      };
    }

    if (user.id !== validated.userId) {
      console.error("User ID mismatch:", { requestedUserId: validated.userId, actualUserId: user.id });
      return { 
        success: false, 
        error: "Unauthorized access",
        code: "UNAUTHORIZED" 
      };
    }

    // Check if teacher profile already exists
    const { data: existing, error: checkError } = await (supabase
      .from("TeacherProfile")
      .select("id")
      .eq("userId", validated.userId)
      .maybeSingle() as unknown as Promise<{ data: { id: string } | null; error: any }>);

    if (checkError && checkError.code !== "PGRST116") {
      console.error("Error checking existing teacher profile:", checkError);
      return { 
        success: false, 
        error: "Failed to check existing profile",
        code: "DATABASE_ERROR" 
      };
    }

    if (existing) {
      console.log("Teacher profile already exists:", existing.id);
      return { 
        success: true, 
        data: {
          id: existing.id,
          userId: validated.userId,
          verified: false
        }
      };
    }

    // Generate UUID
    const teacherId = randomUUID();
    console.log("Creating new teacher profile with id:", teacherId);

    const insertData = {
      id: teacherId,
      userId: validated.userId,
      bio: validated.bio || null,
      location: validated.location || null,
      timezone: validated.timezone || null,
      languages: validated.languages || null,
      hourlyRate: validated.hourlyRate || null,
      currency: validated.currency || "USD",
      availability: validated.availability || null,
      rating: 0,
      totalReviews: 0,
      totalStudents: 0,
      verified: false,
    };

    const { data: teacher, error: insertError } = await (supabase
      .from("TeacherProfile")
      .insert(insertData)
      .select()
      .maybeSingle() as unknown as Promise<{ data: any; error: any }>);

    if (insertError) {
      console.error("Error inserting teacher profile:", insertError);
      return { 
        success: false, 
        error: insertError.message || "Failed to create teacher profile",
        code: "DATABASE_ERROR" 
      };
    }

    if (!teacher) {
      console.error("Teacher profile creation returned no data");
      return { 
        success: false, 
        error: "Failed to create teacher profile",
        code: "DATABASE_ERROR" 
      };
    }

    console.log("Teacher profile created successfully:", teacher.id);
    // Return only plain serializable data
    return { 
      success: true, 
      data: {
        id: teacher.id,
        userId: teacher.userId,
        verified: teacher.verified || false
      }
    };
  } catch (error) {
    console.error("Unexpected error in createTeacherProfile:", error);
    const errorMessage = error instanceof Error ? error.message : String(error || "An unexpected error occurred");
    // Ensure the return value is 100% serializable
    const result = { 
      success: false as const,
      error: String(errorMessage),
      code: "UNKNOWN_ERROR" as const
    };
    console.log("Returning error result:", JSON.stringify(result));
    return result;
  }
}

/**
 * Get teacher profile by ID
 */
export async function getTeacherProfile(teacherId: string) {
  try {
    const validated = idSchema.parse(teacherId);
    const supabase = getSupabaseAdmin();

    const { data: teacher, error } = await (supabase
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
      .single() as unknown as Promise<{ data: any | null; error: any }>);

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
    const { data: user } = await (supabase
      .from("UserProfile")
      .select("id")
      .eq("clerkId", userId)
      .single() as unknown as Promise<{ data: { id: string } | null; error: any }>);

    if (!user) {
      throw new NotFoundError("User");
    }

    // Get teacher profile
    const { data: teacher, error } = await (supabase
      .from("TeacherProfile")
      .select("*")
      .eq("userId", user.id)
      .single() as unknown as Promise<{ data: any | null; error: any }>);

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
      .eq("id", validated.id)
      .single() as unknown as Promise<{ data: { userId: string } | null; error: any }>);

    if (!teacher || teacher.userId !== user.id) {
      throw new UnauthorizedError();
    }

    const { id, ...updateData } = validated;

    const updateQuery = (supabase
      .from("TeacherProfile") as any)
      .update(updateData)
      .eq("id", id)
      .select()
      .single();
    
    const { data: updatedTeacher, error } = await updateQuery;

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

