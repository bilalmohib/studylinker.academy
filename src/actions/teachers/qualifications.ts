"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/db/client";
import {
  handleError,
  NotFoundError,
  ValidationError,
  UnauthorizedError,
} from "@/lib/utils/errors";
import { idSchema } from "@/lib/utils/validation";

const createQualificationSchema = z.object({
  teacherId: idSchema,
  title: z.string().min(1, "Title is required"),
  institution: z.string().optional().nullable(),
  year: z.number().int().min(1900).max(2100).optional().nullable(),
  certificate: z.string().optional().nullable(),
});

const updateQualificationSchema = z.object({
  id: idSchema,
  title: z.string().min(1).optional(),
  institution: z.string().optional().nullable(),
  year: z.number().int().min(1900).max(2100).optional().nullable(),
  certificate: z.string().optional().nullable(),
});

/**
 * Create a qualification
 */
export async function createQualification(
  data: z.infer<typeof createQualificationSchema>
) {
  try {
    const validated = createQualificationSchema.parse(data);
    const { userId } = await auth();

    if (!userId) {
      throw new UnauthorizedError();
    }

    const supabase = getSupabaseAdmin();

    // Verify user owns the teacher profile
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
      .eq("id", validated.teacherId)
      .single();

    if (!teacher || teacher.userId !== user.id) {
      throw new UnauthorizedError();
    }

    const { data: qualification, error } = await supabase
      .from("Qualification")
      .insert({
        id: crypto.randomUUID(),
        ...validated,
      })
      .select()
      .single();

    if (error) {
      throw new ValidationError(error.message);
    }

    return { success: true, data: qualification };
  } catch (error) {
    return { success: false, ...handleError(error) };
  }
}

/**
 * Get qualifications by teacher
 */
export async function getQualificationsByTeacher(teacherId: string) {
  try {
    const validated = idSchema.parse(teacherId);
    const supabase = getSupabaseAdmin();

    const { data: qualifications, error } = await supabase
      .from("Qualification")
      .select("*")
      .eq("teacherId", validated)
      .order("year", { ascending: false, nullsLast: true });

    if (error) {
      throw new ValidationError(error.message);
    }

    return { success: true, data: qualifications || [] };
  } catch (error) {
    return { success: false, ...handleError(error) };
  }
}

/**
 * Update qualification
 */
export async function updateQualification(
  data: z.infer<typeof updateQualificationSchema>
) {
  try {
    const validated = updateQualificationSchema.parse(data);
    const { userId } = await auth();

    if (!userId) {
      throw new UnauthorizedError();
    }

    const supabase = getSupabaseAdmin();

    // Verify ownership
    const { data: qualification } = await supabase
      .from("Qualification")
      .select("teacherId, TeacherProfile!inner(userId, UserProfile!inner(clerkId))")
      .eq("id", validated.id)
      .single();

    if (!qualification) {
      throw new NotFoundError("Qualification");
    }

    const { id, ...updateData } = validated;

    const { data: updatedQualification, error } = await supabase
      .from("Qualification")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new ValidationError(error.message);
    }

    return { success: true, data: updatedQualification };
  } catch (error) {
    return { success: false, ...handleError(error) };
  }
}

/**
 * Delete qualification
 */
export async function deleteQualification(qualificationId: string) {
  try {
    const validated = idSchema.parse(qualificationId);
    const { userId } = await auth();

    if (!userId) {
      throw new UnauthorizedError();
    }

    const supabase = getSupabaseAdmin();

    // Verify ownership
    const { data: qualification } = await supabase
      .from("Qualification")
      .select("teacherId, TeacherProfile!inner(userId, UserProfile!inner(clerkId))")
      .eq("id", validated)
      .single();

    if (!qualification) {
      throw new NotFoundError("Qualification");
    }

    const { error } = await supabase
      .from("Qualification")
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

