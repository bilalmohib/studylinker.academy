"use server";

/**
 * Review Server Actions
 * Handles review/rating CRUD operations
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

const createReviewSchema = z.object({
  contractId: idSchema,
  parentId: idSchema,
  teacherId: idSchema,
  rating: z.number().int().min(1).max(5, "Rating must be between 1 and 5"),
  comment: z.string().optional().nullable(),
  anonymous: z.boolean().default(false),
});

/**
 * Create a new review
 */
export async function createReview(data: z.infer<typeof createReviewSchema>) {
  try {
    const validated = createReviewSchema.parse(data);
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

    // Verify contract exists and belongs to parent
    const { data: contract } = await supabase
      .from("Contract")
      .select("id, parentId, teacherId")
      .eq("id", validated.contractId)
      .single();

    if (!contract || contract.parentId !== validated.parentId) {
      throw new ValidationError("Contract does not belong to parent");
    }

    if (contract.teacherId !== validated.teacherId) {
      throw new ValidationError("Teacher does not match contract");
    }

    // Check if review already exists
    const { data: existing } = await supabase
      .from("Review")
      .select("id")
      .eq("contractId", validated.contractId)
      .eq("parentId", validated.parentId)
      .single();

    if (existing) {
      throw new ValidationError("Review already exists for this contract");
    }

    const { data: review, error } = await supabase
      .from("Review")
      .insert({
        id: crypto.randomUUID(),
        ...validated,
      })
      .select()
      .single();

    if (error) {
      throw new ValidationError(error.message);
    }

    // Update teacher rating
    await updateTeacherRating(validated.teacherId);

    return { success: true, data: review };
  } catch (error) {
    return { success: false, ...handleError(error) };
  }
}

/**
 * Update teacher rating based on all reviews
 */
async function updateTeacherRating(teacherId: string) {
  const supabase = getSupabaseAdmin();

  const { data: reviews } = await supabase
    .from("Review")
    .select("rating")
    .eq("teacherId", teacherId);

  if (!reviews || reviews.length === 0) {
    return;
  }

  const averageRating =
    reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

  await supabase
    .from("TeacherProfile")
    .update({
      rating: Math.round(averageRating * 100) / 100,
      totalReviews: reviews.length,
    })
    .eq("id", teacherId);
}

/**
 * Get reviews by teacher
 */
export async function getReviewsByTeacher(teacherId: string) {
  try {
    const validated = idSchema.parse(teacherId);
    const supabase = getSupabaseAdmin();

    const { data: reviews, error } = await supabase
      .from("Review")
      .select(
        `
        *,
        ParentProfile:parentId (
          id,
          UserProfile:userId (
            id,
            firstName,
            lastName,
            avatar
          )
        ),
        Contract:contractId (
          id,
          subject,
          level
        )
      `
      )
      .eq("teacherId", validated)
      .order("createdAt", { ascending: false });

    if (error) {
      throw new ValidationError(error.message);
    }

    return { success: true, data: reviews || [] };
  } catch (error) {
    return { success: false, ...handleError(error) };
  }
}

/**
 * Get reviews by contract
 */
export async function getReviewsByContract(contractId: string) {
  try {
    const validated = idSchema.parse(contractId);
    const supabase = getSupabaseAdmin();

    const { data: reviews, error } = await supabase
      .from("Review")
      .select(
        `
        *,
        ParentProfile:parentId (
          id,
          UserProfile:userId (
            id,
            firstName,
            lastName,
            avatar
          )
        )
      `
      )
      .eq("contractId", validated)
      .order("createdAt", { ascending: false });

    if (error) {
      throw new ValidationError(error.message);
    }

    return { success: true, data: reviews || [] };
  } catch (error) {
    return { success: false, ...handleError(error) };
  }
}

