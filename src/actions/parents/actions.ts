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
import { randomUUID } from "crypto";

/**
 * Create parent profile
 */
export async function createParentProfile(userId: string) {
  console.log("createParentProfile called with userId:", userId);
  
  try {
    // Validate input
    let validated: string;
    try {
      validated = idSchema.parse(userId);
      console.log("Validated userId:", validated);
    } catch (validationError) {
      console.error("Validation error:", validationError);
      return {
        success: false,
        error: "Invalid user ID format",
        code: "VALIDATION_ERROR"
      };
    }
    
    // Get current authenticated user
    let clerkUserId: string | null;
    try {
      const authResult = await auth();
      clerkUserId = authResult.userId;
      console.log("Current clerkUserId:", clerkUserId);
    } catch (authError) {
      console.error("Auth error:", authError);
      return {
        success: false,
        error: "Authentication failed",
        code: "AUTH_ERROR"
      };
    }

    if (!clerkUserId) {
      console.error("No authenticated user");
      return { 
        success: false, 
        error: "You must be signed in to create a profile",
        code: "UNAUTHORIZED" 
      };
    }

    const supabase = getSupabaseAdmin();

    // Verify user exists and matches
    const { data: user, error: userError } = await (supabase
      .from("UserProfile")
      .select("id, clerkId")
      .eq("id", validated)
      .maybeSingle() as unknown as Promise<{ data: { id: string; clerkId: string } | null; error: any }>);

    if (userError) {
      console.error("Error fetching user:", userError);
      return { 
        success: false, 
        error: "Failed to verify user profile",
        code: "DATABASE_ERROR" 
      };
    }

    if (!user) {
      console.error("User not found:", validated);
      return { 
        success: false, 
        error: "User profile not found",
        code: "NOT_FOUND" 
      };
    }

    if (user.clerkId !== clerkUserId) {
      console.error("ClerkId mismatch:", { userId: validated, clerkUserId, userClerkId: user.clerkId });
      return { 
        success: false, 
        error: "Unauthorized access",
        code: "UNAUTHORIZED" 
      };
    }

    // Check if parent profile already exists
    const { data: existing, error: checkError } = await (supabase
      .from("ParentProfile")
      .select("id")
      .eq("userId", validated)
      .maybeSingle() as unknown as Promise<{ data: { id: string } | null; error: any }>);

    if (checkError && checkError.code !== "PGRST116") {
      console.error("Error checking existing parent profile:", checkError);
      return { 
        success: false, 
        error: "Failed to check existing profile",
        code: "DATABASE_ERROR" 
      };
    }

    // If profile exists, return it
    if (existing) {
      console.log("Parent profile already exists:", existing.id);
      return { 
        success: true, 
        data: {
          id: existing.id,
          userId: validated
        }
      };
    }

    // Generate UUID
    const parentId = randomUUID();
    console.log("Creating new parent profile with id:", parentId);

    const insertData: any = {
      id: parentId,
      userId: validated,
    };

    const { data: parent, error: insertError } = await (supabase
      .from("ParentProfile")
      .insert(insertData as any)
      .select()
      .maybeSingle() as unknown as Promise<{ data: any; error: any }>);

    if (insertError) {
      console.error("Error inserting parent profile:", insertError);
      return { 
        success: false, 
        error: insertError.message || "Failed to create parent profile",
        code: "DATABASE_ERROR" 
      };
    }

    if (!parent) {
      console.error("Parent profile creation returned no data");
      return { 
        success: false, 
        error: "Failed to create parent profile",
        code: "DATABASE_ERROR" 
      };
    }

    console.log("Parent profile created successfully:", parent.id);
    // Return only plain serializable data
    return { 
      success: true, 
      data: {
        id: parent.id,
        userId: parent.userId
      }
    };
  } catch (error) {
    console.error("Unexpected error in createParentProfile:", error);
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

