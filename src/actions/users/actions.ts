"use server";

/**
 * User Profile Server Actions
 * Handles user profile CRUD operations
 */

import { getSupabaseAdmin } from "@/lib/db/client";
import { handleError, NotFoundError, ValidationError, UnauthorizedError } from "@/lib/utils/errors";
import { idSchema, emailSchema, userRoleSchema, paginationSchema } from "@/lib/utils/validation";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";

const createUserSchema = z.object({
  clerkId: z.string().min(1, "Clerk ID is required"),
  email: emailSchema,
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  avatar: z.string().url().optional().nullable().or(z.literal("").transform(() => null)),
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
    // Pre-process data to handle edge cases
    const processedData = {
      ...data,
      avatar: data.avatar && data.avatar.trim() !== "" ? data.avatar : null,
      firstName: data.firstName && data.firstName.trim() !== "" ? data.firstName : null,
      lastName: data.lastName && data.lastName.trim() !== "" ? data.lastName : null,
    };

    const validated = createUserSchema.parse(processedData);
    const supabase = getSupabaseAdmin();

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from("UserProfile")
      .select("id")
      .eq("clerkId", validated.clerkId)
      .single();

    if (existingUser) {
      return { success: true, data: existingUser };
    }

    // Generate UUID using Node.js crypto
    const crypto = await import("crypto");
    const userId = crypto.randomUUID();

    const insertData: any = {
      id: userId,
      clerkId: validated.clerkId,
      email: validated.email,
      firstName: validated.firstName || null,
      lastName: validated.lastName || null,
      avatar: validated.avatar || null,
      role: validated.role,
    };

    const { data: user, error } = await (supabase
      .from("UserProfile")
      .insert(insertData as any)
      .select()
      .single() as unknown as Promise<{ data: any; error: any }>);

    if (error) {
      console.error("Supabase error creating user profile:", error);
      throw new ValidationError(error.message || "Failed to create user profile");
    }

    return { success: true, data: user };
  } catch (error) {
    console.error("Error in createUserProfile:", error);
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
    if (!currentUser.success || !("data" in currentUser)) {
      throw new NotFoundError("User");
    }
    const userData = currentUser.data as { id: string } | undefined;
    if (!userData || userData.id !== validated.id) {
      throw new NotFoundError("User");
    }

    const supabase = getSupabaseAdmin();
    const { id, ...updateData } = validated;

    const updatePayload: Record<string, any> = {};
    if (updateData.firstName !== undefined) updatePayload.firstName = updateData.firstName;
    if (updateData.lastName !== undefined) updatePayload.lastName = updateData.lastName;
    if (updateData.avatar !== undefined) updatePayload.avatar = updateData.avatar;
    if (updateData.role !== undefined) updatePayload.role = updateData.role;

    const updateQuery = (supabase
      .from("UserProfile") as any)
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();
    
    const { data: user, error } = await updateQuery;

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
    if (!currentUser.success || !("data" in currentUser)) {
      throw new NotFoundError("User");
    }
    const userData = currentUser.data as { id: string } | undefined;
    if (!userData || userData.id !== validated) {
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

const getAllUsersSchema = z.object({
  role: userRoleSchema.optional(),
  search: z.string().optional(),
  ...paginationSchema.shape,
});

/**
 * Get all users (admin only)
 */
export async function getAllUsers(filters?: z.infer<typeof getAllUsersSchema>) {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new UnauthorizedError();
    }

    // Check if user is admin
    const supabase = getSupabaseAdmin();
    const { data: currentUser } = await supabase
      .from("UserProfile")
      .select("isAdmin")
      .eq("clerkId", userId)
      .single();

    if (!currentUser || !(currentUser as { isAdmin: boolean }).isAdmin) {
      throw new UnauthorizedError("Admin access required");
    }

    const validated = filters ? getAllUsersSchema.parse(filters) : { page: 1, limit: 20 };
    const page = validated.page || 1;
    const limit = validated.limit || 20;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from("UserProfile")
      .select("*", { count: "exact" })
      .order("createdAt", { ascending: false });

    if (validated.role) {
      query = query.eq("role", validated.role);
    }

    if (validated.search) {
      query = query.or(
        `firstName.ilike.%${validated.search}%,lastName.ilike.%${validated.search}%,email.ilike.%${validated.search}%`
      );
    }

    query = query.range(from, to);

    const { data: users, error, count } = await query;

    if (error) {
      throw new ValidationError(error.message);
    }

    return {
      success: true,
      data: users || [],
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

/**
 * Update user profile (admin)
 */
export async function updateUserProfileAdmin(
  data: z.infer<typeof updateUserSchema> & { isAdmin?: boolean }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new UnauthorizedError();
    }

    // Check if user is admin
    const supabase = getSupabaseAdmin();
    const { data: currentUser } = await (supabase
      .from("UserProfile")
      .select("isAdmin")
      .eq("clerkId", userId)
      .single() as unknown as Promise<{ data: { isAdmin: boolean } | null; error: any }>);

    if (!currentUser || !currentUser.isAdmin) {
      throw new UnauthorizedError("Admin access required");
    }

    const validated = updateUserSchema.parse(data);
    const updateData: Record<string, any> = {};

    if (validated.firstName !== undefined) {
      updateData.firstName = validated.firstName;
    }
    if (validated.lastName !== undefined) {
      updateData.lastName = validated.lastName;
    }
    if (validated.avatar !== undefined) {
      updateData.avatar = validated.avatar;
    }
    if (validated.role !== undefined) {
      updateData.role = validated.role;
    }
    if (data.isAdmin !== undefined) {
      updateData.isAdmin = data.isAdmin;
    }

    updateData.updatedAt = new Date().toISOString();

    const updateQuery = (supabase
      .from("UserProfile") as any)
      .update(updateData)
      .eq("id", validated.id)
      .select()
      .single();
    
    const { data: user, error } = await updateQuery;

    if (error) {
      throw new ValidationError(error.message);
    }

    return { success: true, data: user };
  } catch (error) {
    return { success: false, ...handleError(error) };
  }
}

