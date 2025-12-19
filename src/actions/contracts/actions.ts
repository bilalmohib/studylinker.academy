"use server";

/**
 * Contract Server Actions
 * Handles contract CRUD operations
 */

import { getSupabaseAdmin } from "@/lib/db/client";
import {
  handleError,
  NotFoundError,
  ValidationError,
  UnauthorizedError,
} from "@/lib/utils/errors";
import { idSchema, contractStatusSchema } from "@/lib/utils/validation";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";

const createContractSchema = z.object({
  parentId: idSchema,
  teacherId: idSchema,
  studentId: idSchema,
  jobId: idSchema.optional().nullable(),
  subject: z.string().min(1, "Subject is required"),
  level: z.string().min(1, "Level is required"),
  rate: z.number().positive("Rate must be positive"),
  currency: z.string().default("USD"),
  hoursPerWeek: z.string().min(1, "Hours per week is required"),
  schedule: z.record(z.any()).optional().nullable(),
  curriculum: z.boolean().default(false),
  startDate: z.string().datetime("Invalid start date"),
  endDate: z.string().datetime().optional().nullable(),
});

const updateContractSchema = z.object({
  id: idSchema,
  subject: z.string().optional(),
  level: z.string().optional(),
  rate: z.number().positive().optional(),
  currency: z.string().optional(),
  hoursPerWeek: z.string().optional(),
  schedule: z.record(z.any()).optional().nullable(),
  curriculum: z.boolean().optional(),
  status: contractStatusSchema.optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional().nullable(),
});

/**
 * Create a new contract
 */
export async function createContract(
  data: z.infer<typeof createContractSchema>
) {
  try {
    const validated = createContractSchema.parse(data);
    const { userId } = await auth();

    if (!userId) {
      throw new UnauthorizedError();
    }

    const supabase = getSupabaseAdmin();

    // Verify parent ownership
    const { data: parent } = await supabase
      .from("ParentProfile")
      .select("userId, UserProfile!inner(clerkId)")
      .eq("id", validated.parentId)
      .single();

    if (!parent) {
      throw new NotFoundError("Parent");
    }

    // Verify student belongs to parent
    const { data: student } = await supabase
      .from("Student")
      .select("parentId")
      .eq("id", validated.studentId)
      .single();

    if (!student || student.parentId !== validated.parentId) {
      throw new ValidationError("Student does not belong to parent");
    }

    const { data: contract, error } = await supabase
      .from("Contract")
      .insert({
        id: crypto.randomUUID(),
        ...validated,
        status: "ACTIVE",
      })
      .select()
      .single();

    if (error) {
      throw new ValidationError(error.message);
    }

    return { success: true, data: contract };
  } catch (error) {
    return { success: false, ...handleError(error) };
  }
}

/**
 * Get contract by ID
 */
export async function getContract(contractId: string) {
  try {
    const validated = idSchema.parse(contractId);
    const supabase = getSupabaseAdmin();

    const { data: contract, error } = await supabase
      .from("Contract")
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
        ),
        Student:studentId (
          id,
          firstName,
          lastName,
          age,
          grade
        )
      `
      )
      .eq("id", validated)
      .single();

    if (error || !contract) {
      throw new NotFoundError("Contract");
    }

    return { success: true, data: contract };
  } catch (error) {
    return { success: false, ...handleError(error) };
  }
}

/**
 * Update contract
 */
export async function updateContract(
  data: z.infer<typeof updateContractSchema>
) {
  try {
    const validated = updateContractSchema.parse(data);
    const { userId } = await auth();

    if (!userId) {
      throw new UnauthorizedError();
    }

    const supabase = getSupabaseAdmin();

    // Verify ownership (parent or teacher)
    const { data: contract } = await supabase
      .from("Contract")
      .select(
        "id, parentId, teacherId, ParentProfile!inner(userId, UserProfile!inner(clerkId)), TeacherProfile!inner(userId, UserProfile!inner(clerkId))"
      )
      .eq("id", validated.id)
      .single();

    if (!contract) {
      throw new NotFoundError("Contract");
    }

    const { id, ...updateData } = validated;

    const { data: updatedContract, error } = await supabase
      .from("Contract")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new ValidationError(error.message);
    }

    return { success: true, data: updatedContract };
  } catch (error) {
    return { success: false, ...handleError(error) };
  }
}

/**
 * Get contracts by parent
 */
export async function getContractsByParent(parentId: string) {
  try {
    const validated = idSchema.parse(parentId);
    const supabase = getSupabaseAdmin();

    const { data: contracts, error } = await supabase
      .from("Contract")
      .select(
        `
        *,
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
        ),
        Student:studentId (
          id,
          firstName,
          lastName,
          age,
          grade
        )
      `
      )
      .eq("parentId", validated)
      .order("createdAt", { ascending: false });

    if (error) {
      throw new ValidationError(error.message);
    }

    return { success: true, data: contracts || [] };
  } catch (error) {
    return { success: false, ...handleError(error) };
  }
}

/**
 * Get contracts by teacher
 */
export async function getContractsByTeacher(teacherId: string) {
  try {
    const validated = idSchema.parse(teacherId);
    const supabase = getSupabaseAdmin();

    const { data: contracts, error } = await supabase
      .from("Contract")
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
        ),
        Student:studentId (
          id,
          firstName,
          lastName,
          age,
          grade
        )
      `
      )
      .eq("teacherId", validated)
      .order("createdAt", { ascending: false });

    if (error) {
      throw new ValidationError(error.message);
    }

    return { success: true, data: contracts || [] };
  } catch (error) {
    return { success: false, ...handleError(error) };
  }
}

