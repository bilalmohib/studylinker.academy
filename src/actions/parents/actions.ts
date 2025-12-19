"use server";

/**
 * Parent Profile Server Actions
 * Handles parent profile operations
 */

import { getSupabaseAdmin } from "@/lib/db/client";
import {
  handleError,
  NotFoundError,
  ValidationError,
  UnauthorizedError,
} from "@/lib/utils/errors";
import { idSchema } from "@/lib/utils/validation";
import { auth } from "@clerk/nextjs/server";

/**
 * Create parent profile
 */
export async function createParentProfile(userId: string) {
  try {
    const validated = idSchema.parse(userId);
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      throw new UnauthorizedError();
    }

    const supabase = getSupabaseAdmin();

    // Verify user exists and matches
    const { data: user } = await supabase
      .from("UserProfile")
      .select("id, clerkId")
      .eq("id", validated)
      .single();

    if (!user || user.clerkId !== clerkUserId) {
      throw new UnauthorizedError();
    }

    // Check if parent profile already exists
    const { data: existing } = await supabase
      .from("ParentProfile")
      .select("id")
      .eq("userId", validated)
      .single();

    if (existing) {
      return { success: true, data: existing };
    }

    const { data: parent, error } = await supabase
      .from("ParentProfile")
      .insert({
        id: crypto.randomUUID(),
        userId: validated,
      })
      .select()
      .single();

    if (error) {
      throw new ValidationError(error.message);
    }

    return { success: true, data: parent };
  } catch (error) {
    return { success: false, ...handleError(error) };
  }
}

/**
 * Get parent profile by user ID
 */
export async function getParentProfileByUserId(userId: string) {
  try {
    const validated = idSchema.parse(userId);
    const supabase = getSupabaseAdmin();

    const { data: parent, error } = await supabase
      .from("ParentProfile")
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
      .eq("userId", validated)
      .single();

    if (error || !parent) {
      throw new NotFoundError("Parent profile");
    }

    return { success: true, data: parent };
  } catch (error) {
    return { success: false, ...handleError(error) };
  }
}

/**
 * Get current parent profile
 */
export async function getCurrentParentProfile() {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new UnauthorizedError();
    }

    const supabase = getSupabaseAdmin();

    const { data: user } = await supabase
      .from("UserProfile")
      .select("id")
      .eq("clerkId", userId)
      .single();

    if (!user) {
      throw new NotFoundError("User");
    }

    return await getParentProfileByUserId(user.id);
  } catch (error) {
    return { success: false, ...handleError(error) };
  }
}

