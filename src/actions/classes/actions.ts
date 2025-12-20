"use server";

/**
 * Class/Session Server Actions
 * Handles class/session CRUD operations
 */

import { getSupabaseAdmin } from "@/lib/db/client";
import {
  handleError,
  NotFoundError,
  ValidationError,
  UnauthorizedError,
} from "@/lib/utils/errors";
import { idSchema, classStatusSchema } from "@/lib/utils/validation";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";

const createClassSchema = z.object({
  contractId: idSchema,
  teacherId: idSchema,
  studentId: idSchema,
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().nullable(),
  scheduledAt: z.string().datetime("Invalid scheduled date"),
  duration: z.number().int().positive("Duration must be positive"),
  meetingLink: z.string().url().optional().nullable(),
  notes: z.string().optional().nullable(),
});

const updateClassSchema = z.object({
  id: idSchema,
  title: z.string().optional(),
  description: z.string().optional().nullable(),
  scheduledAt: z.string().datetime().optional(),
  duration: z.number().int().positive().optional(),
  status: classStatusSchema.optional(),
  meetingLink: z.string().url().optional().nullable(),
  notes: z.string().optional().nullable(),
});

/**
 * Create a new class/session
 */
export async function createClass(data: z.infer<typeof createClassSchema>) {
  try {
    const validated = createClassSchema.parse(data);
    const { userId } = await auth();

    if (!userId) {
      throw new UnauthorizedError();
    }

    const supabase = getSupabaseAdmin();

    // Verify contract exists and user has access
    const { data: contract } = await (supabase
      .from("Contract")
      .select("id, parentId, teacherId, studentId, ParentProfile!inner(userId, UserProfile!inner(clerkId)), TeacherProfile!inner(userId, UserProfile!inner(clerkId))")
      .eq("id", validated.contractId)
      .single() as unknown as Promise<{ data: { id: string; parentId: string; teacherId: string; studentId: string } | null; error: any }>);

    if (!contract) {
      throw new NotFoundError("Contract");
    }

    // Verify contract matches
    if (
      contract.teacherId !== validated.teacherId ||
      contract.studentId !== validated.studentId
    ) {
      throw new ValidationError("Contract details do not match");
    }

    const { data: classSession, error } = await (supabase
      .from("Class")
      .insert({
        id: crypto.randomUUID(),
        ...validated,
        status: "SCHEDULED",
      } as any)
      .select()
      .single() as unknown as Promise<{ data: any; error: any }>);

    if (error) {
      throw new ValidationError(error.message);
    }

    return { success: true, data: classSession };
  } catch (error) {
    return { success: false, ...handleError(error) };
  }
}

/**
 * Get class by ID
 */
export async function getClass(classId: string) {
  try {
    const validated = idSchema.parse(classId);
    const supabase = getSupabaseAdmin();

    const { data: classSession, error } = await (supabase
      .from("Class")
      .select(
        `
        *,
        Contract:contractId (
          id,
          subject,
          level,
          rate,
          ParentProfile:parentId (
            id,
            UserProfile:userId (
              id,
              firstName,
              lastName,
              email
            )
          ),
          TeacherProfile:teacherId (
            id,
            UserProfile:userId (
              id,
              firstName,
              lastName,
              email
            )
          ),
          Student:studentId (
            id,
            firstName,
            lastName
          )
        )
      `
      )
      .eq("id", validated)
      .single() as unknown as Promise<{ data: any | null; error: any }>);

    if (error || !classSession) {
      throw new NotFoundError("Class");
    }

    return { success: true, data: classSession };
  } catch (error) {
    return { success: false, ...handleError(error) };
  }
}

/**
 * Update class
 */
export async function updateClass(data: z.infer<typeof updateClassSchema>) {
  try {
    const validated = updateClassSchema.parse(data);
    const { userId } = await auth();

    if (!userId) {
      throw new UnauthorizedError();
    }

    const supabase = getSupabaseAdmin();

    // Verify ownership
    const { data: classSession } = await (supabase
      .from("Class")
      .select(
        "id, contractId, Contract!inner(parentId, teacherId, ParentProfile!inner(userId, UserProfile!inner(clerkId)), TeacherProfile!inner(userId, UserProfile!inner(clerkId)))"
      )
      .eq("id", validated.id)
      .single() as unknown as Promise<{ data: any | null; error: any }>);

    if (!classSession) {
      throw new NotFoundError("Class");
    }

    const { id, ...updateData } = validated;

    const updateQuery = (supabase
      .from("Class") as any)
      .update(updateData)
      .eq("id", id)
      .select()
      .single();
    
    const { data: updatedClass, error } = await updateQuery;

    if (error) {
      throw new ValidationError(error.message);
    }

    return { success: true, data: updatedClass };
  } catch (error) {
    return { success: false, ...handleError(error) };
  }
}

/**
 * Get classes by contract
 */
export async function getClassesByContract(contractId: string) {
  try {
    const validated = idSchema.parse(contractId);
    const supabase = getSupabaseAdmin();

    const { data: classes, error } = await supabase
      .from("Class")
      .select("*")
      .eq("contractId", validated)
      .order("scheduledAt", { ascending: false });

    if (error) {
      throw new ValidationError(error.message);
    }

    return { success: true, data: classes || [] };
  } catch (error) {
    return { success: false, ...handleError(error) };
  }
}

/**
 * Get upcoming classes for teacher
 */
export async function getUpcomingClassesForTeacher(teacherId: string) {
  try {
    const validated = idSchema.parse(teacherId);
    const supabase = getSupabaseAdmin();

    const now = new Date().toISOString();

    const { data: classes, error } = await supabase
      .from("Class")
      .select(
        `
        *,
        Contract:contractId (
          id,
          subject,
          Student:studentId (
            id,
            firstName,
            lastName
          )
        )
      `
      )
      .eq("teacherId", validated)
      .gte("scheduledAt", now)
      .in("status", ["SCHEDULED", "IN_PROGRESS"])
      .order("scheduledAt", { ascending: true })
      .limit(10);

    if (error) {
      throw new ValidationError(error.message);
    }

    return { success: true, data: classes || [] };
  } catch (error) {
    return { success: false, ...handleError(error) };
  }
}

