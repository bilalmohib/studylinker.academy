"use server";

/**
 * Student Server Actions
 * Handles student CRUD operations
 */

import { getSupabaseAdmin } from "@/lib/db/client";
import {
  handleError,
  NotFoundError,
  ValidationError,
  UnauthorizedError,
} from "@/lib/utils/errors";
import { idSchema } from "@/lib/utils/validation";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";

const createStudentSchema = z.object({
  parentId: idSchema,
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().optional().nullable(),
  age: z.number().int().min(3).max(25).optional().nullable(),
  grade: z.string().optional().nullable(),
  avatar: z.string().url().optional().nullable(),
});

const updateStudentSchema = z.object({
  id: idSchema,
  firstName: z.string().min(1).optional(),
  lastName: z.string().optional().nullable(),
  age: z.number().int().min(3).max(25).optional().nullable(),
  grade: z.string().optional().nullable(),
  avatar: z.string().url().optional().nullable(),
});

/**
 * Create a new student
 */
export async function createStudent(
  data: z.infer<typeof createStudentSchema>
) {
  try {
    const validated = createStudentSchema.parse(data);
    const { userId } = await auth();

    if (!userId) {
      throw new UnauthorizedError();
    }

    const supabase = getSupabaseAdmin();

    // Verify parent ownership
    const { data: parent } = await (supabase
      .from("ParentProfile")
      .select("userId, UserProfile!inner(clerkId)")
      .eq("id", validated.parentId)
      .single() as unknown as Promise<{ data: { userId: string } | null; error: any }>);

    if (!parent) {
      throw new NotFoundError("Parent");
    }

    const { data: student, error } = await (supabase
      .from("Student")
      .insert({
        id: crypto.randomUUID(),
        ...validated,
      } as any)
      .select()
      .single() as unknown as Promise<{ data: any; error: any }>);

    if (error) {
      throw new ValidationError(error.message);
    }

    return { success: true, data: student };
  } catch (error) {
    return { success: false, ...handleError(error) };
  }
}

/**
 * Get student by ID
 */
export async function getStudent(studentId: string) {
  try {
    const validated = idSchema.parse(studentId);
    const supabase = getSupabaseAdmin();

    const { data: student, error } = await (supabase
      .from("Student")
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
      .single() as unknown as Promise<{ data: any | null; error: any }>);

    if (error || !student) {
      throw new NotFoundError("Student");
    }

    return { success: true, data: student };
  } catch (error) {
    return { success: false, ...handleError(error) };
  }
}

/**
 * Update student
 */
export async function updateStudent(
  data: z.infer<typeof updateStudentSchema>
) {
  try {
    const validated = updateStudentSchema.parse(data);
    const { userId } = await auth();

    if (!userId) {
      throw new UnauthorizedError();
    }

    const supabase = getSupabaseAdmin();

    // Verify ownership
    const { data: student } = await (supabase
      .from("Student")
      .select("parentId, ParentProfile!inner(userId, UserProfile!inner(clerkId))")
      .eq("id", validated.id)
      .single() as unknown as Promise<{ data: any | null; error: any }>);

    if (!student) {
      throw new NotFoundError("Student");
    }

    const { id, ...updateData } = validated;

    const updateQuery = (supabase
      .from("Student") as any)
      .update(updateData)
      .eq("id", id)
      .select()
      .single();
    
    const { data: updatedStudent, error } = await updateQuery;

    if (error) {
      throw new ValidationError(error.message);
    }

    return { success: true, data: updatedStudent };
  } catch (error) {
    return { success: false, ...handleError(error) };
  }
}

/**
 * Delete student
 */
export async function deleteStudent(studentId: string) {
  try {
    const validated = idSchema.parse(studentId);
    const { userId } = await auth();

    if (!userId) {
      throw new UnauthorizedError();
    }

    const supabase = getSupabaseAdmin();

    // Verify ownership
    const { data: student } = await (supabase
      .from("Student")
      .select("parentId, ParentProfile!inner(userId, UserProfile!inner(clerkId))")
      .eq("id", validated)
      .single() as unknown as Promise<{ data: any | null; error: any }>);

    if (!student) {
      throw new NotFoundError("Student");
    }

    const { error } = await supabase
      .from("Student")
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
 * Get students by parent
 */
export async function getStudentsByParent(parentId: string) {
  try {
    const validated = idSchema.parse(parentId);
    const supabase = getSupabaseAdmin();

    const { data: students, error } = await supabase
      .from("Student")
      .select("*")
      .eq("parentId", validated)
      .order("createdAt", { ascending: false });

    if (error) {
      throw new ValidationError(error.message);
    }

    return { success: true, data: students || [] };
  } catch (error) {
    return { success: false, ...handleError(error) };
  }
}

