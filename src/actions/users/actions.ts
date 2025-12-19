"use server";

/**
 * User Profile Server Actions
 * Handles user profile CRUD operations
 */

import { getSupabaseAdmin } from "@/lib/db/client";
import { handleError, NotFoundError, ValidationError } from "@/lib/utils/errors";
import { idSchema, emailSchema, userRoleSchema } from "@/lib/utils/validation";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";

const createUserSchema = z.object({
  clerkId: z.string().min(1, "Clerk ID is required"),
  email: emailSchema,
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  avatar: z.string().url().optional().nullable(),
  role: userRoleSchema.default("PARENT"),
});

const updateUserSchema = z.object({
  id: idSchema,
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  avatar: z.string().url().optional().nullable(),
  role: userRoleSchema.optional(),
});

/**
 * Create a new user profile
 */
export async function createUserProfile(data: z.infer<typeof createUserSchema>) {
  try {
    const validated = createUserSchema.parse(data);
    const supabase = getSupabaseAdmin();

    const { data: user, error } = await supabase
      .from("UserProfile")
      .insert({
        id: crypto.randomUUID(),
        ...validated,
      })
      .select()
      .single();

    if (error) {
      throw new ValidationError(error.message);
    }

    return { success: true, data: user };
  } catch (error) {
    return { success: false, ...handleError(error) };
  }
}

/**
 * Get user profile by ID
 */
export async function getUserProfile(userId: string) {
  try {
    const validated = idSchema.parse(userId);
    const supabase = getSupabaseAdmin();

    const { data: user, error } = await supabase
      .from("UserProfile")
      .select("*")
      .eq("id", validated)
      .single();

    if (error || !user) {
      throw new NotFoundError("User");
    }

    return { success: true, data: user };
  } catch (error) {
    return { success: false, ...handleError(error) };
  }
}

/**
 * Get user profile by Clerk ID
 */
export async function getUserProfileByClerkId(clerkId: string) {
  try {
    const validated = z.string().min(1).parse(clerkId);
    const supabase = getSupabaseAdmin();

    const { data: user, error } = await supabase
      .from("UserProfile")
      .select("*")
      .eq("clerkId", validated)
      .single();

    if (error || !user) {
      throw new NotFoundError("User");
    }

    return { success: true, data: user };
  } catch (error) {
    return { success: false, ...handleError(error) };
  }
}

/**
 * Get current authenticated user profile
 */
export async function getCurrentUserProfile() {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new NotFoundError("User");
    }

    return await getUserProfileByClerkId(userId);
  } catch (error) {
    return { success: false, ...handleError(error) };
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  data: z.infer<typeof updateUserSchema>
) {
  try {
    const validated = updateUserSchema.parse(data);
    const { userId } = await auth();

    if (!userId) {
      throw new NotFoundError("User");
    }

    // Verify user owns this profile
    const currentUser = await getUserProfileByClerkId(userId);
    if (!currentUser.success || currentUser.data.id !== validated.id) {
      throw new NotFoundError("User");
    }

    const supabase = getSupabaseAdmin();
    const { id, ...updateData } = validated;

    const { data: user, error } = await supabase
      .from("UserProfile")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new ValidationError(error.message);
    }

    return { success: true, data: user };
  } catch (error) {
    return { success: false, ...handleError(error) };
  }
}

/**
 * Delete user profile
 */
export async function deleteUserProfile(userId: string) {
  try {
    const validated = idSchema.parse(userId);
    const { userId: currentUserId } = await auth();

    if (!currentUserId) {
      throw new NotFoundError("User");
    }

    // Verify user owns this profile
    const currentUser = await getUserProfileByClerkId(currentUserId);
    if (!currentUser.success || currentUser.data.id !== validated) {
      throw new NotFoundError("User");
    }

    const supabase = getSupabaseAdmin();

    const { error } = await supabase
      .from("UserProfile")
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

