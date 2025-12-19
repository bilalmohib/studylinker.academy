"use server";

/**
 * Teacher Subjects Server Actions
 * Handles teacher subject and level management
 */

import { getSupabaseAdmin } from "@/lib/db/client";
import { handleError, NotFoundError, ValidationError } from "@/lib/utils/errors";
import { idSchema } from "@/lib/utils/validation";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";

const addSubjectSchema = z.object({
  teacherId: idSchema,
  subject: z.string().min(1, "Subject is required"),
  experience: z.number().int().min(0).optional().nullable(),
});

const addLevelSchema = z.object({
  teacherId: idSchema,
  level: z.string().min(1, "Level is required"),
});

/**
 * Add subject to teacher profile
 */
export async function addTeacherSubject(
  data: z.infer<typeof addSubjectSchema>
) {
  try {
    const validated = addSubjectSchema.parse(data);
    const { userId } = await auth();

    if (!userId) {
      throw new NotFoundError("User");
    }

    const supabase = getSupabaseAdmin();

    // Verify ownership
    const { data: user } = await supabase
      .from("UserProfile")
      .select("id")
      .eq("clerkId", userId)
      .single();

    if (!user) {
      throw new NotFoundError("User");
    }

    const { data: teacher } = await supabase
      .from("TeacherProfile")
      .select("userId")
      .eq("id", validated.teacherId)
      .single();

    if (!teacher || teacher.userId !== user.id) {
      throw new NotFoundError("Teacher");
    }

    const { data: subject, error } = await supabase
      .from("TeacherSubject")
      .insert({
        id: crypto.randomUUID(),
        ...validated,
      })
      .select()
      .single();

    if (error) {
      throw new ValidationError(error.message);
    }

    return { success: true, data: subject };
  } catch (error) {
    return { success: false, ...handleError(error) };
  }
}

/**
 * Remove subject from teacher profile
 */
export async function removeTeacherSubject(subjectId: string) {
  try {
    const validated = idSchema.parse(subjectId);
    const { userId } = await auth();

    if (!userId) {
      throw new NotFoundError("User");
    }

    const supabase = getSupabaseAdmin();

    // Verify ownership
    const { data: subject } = await supabase
      .from("TeacherSubject")
      .select("teacherId, TeacherProfile!inner(userId, UserProfile!inner(clerkId))")
      .eq("id", validated)
      .single();

    if (!subject) {
      throw new NotFoundError("Subject");
    }

    const { error } = await supabase
      .from("TeacherSubject")
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
 * Get teacher subjects
 */
export async function getTeacherSubjects(teacherId: string) {
  try {
    const validated = idSchema.parse(teacherId);
    const supabase = getSupabaseAdmin();

    const { data: subjects, error } = await supabase
      .from("TeacherSubject")
      .select("*")
      .eq("teacherId", validated)
      .order("subject");

    if (error) {
      throw new ValidationError(error.message);
    }

    return { success: true, data: subjects || [] };
  } catch (error) {
    return { success: false, ...handleError(error) };
  }
}

/**
 * Add level to teacher profile
 */
export async function addTeacherLevel(data: z.infer<typeof addLevelSchema>) {
  try {
    const validated = addLevelSchema.parse(data);
    const { userId } = await auth();

    if (!userId) {
      throw new NotFoundError("User");
    }

    const supabase = getSupabaseAdmin();

    // Verify ownership
    const { data: user } = await supabase
      .from("UserProfile")
      .select("id")
      .eq("clerkId", userId)
      .single();

    if (!user) {
      throw new NotFoundError("User");
    }

    const { data: teacher } = await supabase
      .from("TeacherProfile")
      .select("userId")
      .eq("id", validated.teacherId)
      .single();

    if (!teacher || teacher.userId !== user.id) {
      throw new NotFoundError("Teacher");
    }

    const { data: level, error } = await supabase
      .from("TeacherLevel")
      .insert({
        id: crypto.randomUUID(),
        ...validated,
      })
      .select()
      .single();

    if (error) {
      throw new ValidationError(error.message);
    }

    return { success: true, data: level };
  } catch (error) {
    return { success: false, ...handleError(error) };
  }
}

/**
 * Get teacher levels
 */
export async function getTeacherLevels(teacherId: string) {
  try {
    const validated = idSchema.parse(teacherId);
    const supabase = getSupabaseAdmin();

    const { data: levels, error } = await supabase
      .from("TeacherLevel")
      .select("*")
      .eq("teacherId", validated)
      .order("level");

    if (error) {
      throw new ValidationError(error.message);
    }

    return { success: true, data: levels || [] };
  } catch (error) {
    return { success: false, ...handleError(error) };
  }
}

