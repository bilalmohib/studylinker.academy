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
    const { data: user } = await (supabase
      .from("UserProfile")
      .select("id, clerkId")
      .eq("id", validated)
      .single() as unknown as Promise<{ data: { id: string; clerkId: string } | null; error: any }>);

    if (!user || user.clerkId !== clerkUserId) {
      throw new UnauthorizedError();
    }

    // Check if parent profile already exists
    const { data: existing } = await (supabase
      .from("ParentProfile")
      .select("id")
      .eq("userId", validated)
      .single() as unknown as Promise<{ data: { id: string } | null; error: any }>);

    if (existing) {
      return { success: true, data: existing };
    }

    // Generate UUID using Node.js crypto
    const crypto = await import("crypto");
    const parentId = crypto.randomUUID();

    const insertData: any = {
      id: parentId,
      userId: validated,
    };

    const { data: parent, error } = await (supabase
      .from("ParentProfile")
      .insert(insertData)
      .select()
      .single() as unknown as Promise<{ data: any; error: any }>);

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

    const { data: parent, error } = await (supabase
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
      .single() as unknown as Promise<{ data: any | null; error: any }>);

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

    const { data: user } = await (supabase
      .from("UserProfile")
      .select("id")
      .eq("clerkId", userId)
      .single() as unknown as Promise<{ data: { id: string } | null; error: any }>);

    if (!user) {
      throw new NotFoundError("User");
    }

    return await getParentProfileByUserId(user.id);
  } catch (error) {
    return { success: false, ...handleError(error) };
  }
}

