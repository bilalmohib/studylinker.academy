"use server";

/**
 * Payment Server Actions
 * Handles payment operations
 */

import { getSupabaseAdmin } from "@/lib/db/client";
import {
  handleError,
  NotFoundError,
  ValidationError,
  UnauthorizedError,
} from "@/lib/utils/errors";
import { idSchema, paymentStatusSchema } from "@/lib/utils/validation";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";

const createPaymentSchema = z.object({
  contractId: idSchema,
  amount: z.number().positive("Amount must be positive"),
  currency: z.string().default("USD"),
  paymentMethod: z.string().optional().nullable(),
  transactionId: z.string().optional().nullable(),
});

const updatePaymentSchema = z.object({
  id: idSchema,
  status: paymentStatusSchema.optional(),
  transactionId: z.string().optional().nullable(),
  paidAt: z.string().datetime().optional().nullable(),
});

/**
 * Create a new payment
 */
export async function createPayment(
  data: z.infer<typeof createPaymentSchema>
) {
  try {
    const validated = createPaymentSchema.parse(data);
    const { userId } = await auth();

    if (!userId) {
      throw new UnauthorizedError();
    }

    const supabase = getSupabaseAdmin();

    // Verify contract exists and user has access
    const { data: contract } = await supabase
      .from("Contract")
      .select(
        "id, parentId, ParentProfile!inner(userId, UserProfile!inner(clerkId))"
      )
      .eq("id", validated.contractId)
      .single();

    if (!contract) {
      throw new NotFoundError("Contract");
    }

    const { data: payment, error } = await supabase
      .from("Payment")
      .insert({
        id: crypto.randomUUID(),
        ...validated,
        status: "PENDING",
      })
      .select()
      .single();

    if (error) {
      throw new ValidationError(error.message);
    }

    return { success: true, data: payment };
  } catch (error) {
    return { success: false, ...handleError(error) };
  }
}

/**
 * Get payment by ID
 */
export async function getPayment(paymentId: string) {
  try {
    const validated = idSchema.parse(paymentId);
    const supabase = getSupabaseAdmin();

    const { data: payment, error } = await supabase
      .from("Payment")
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
          )
        )
      `
      )
      .eq("id", validated)
      .single();

    if (error || !payment) {
      throw new NotFoundError("Payment");
    }

    return { success: true, data: payment };
  } catch (error) {
    return { success: false, ...handleError(error) };
  }
}

/**
 * Update payment status
 */
export async function updatePayment(data: z.infer<typeof updatePaymentSchema>) {
  try {
    const validated = updatePaymentSchema.parse(data);
    const { userId } = await auth();

    if (!userId) {
      throw new UnauthorizedError();
    }

    const supabase = getSupabaseAdmin();

    // Verify ownership
    const { data: payment } = await supabase
      .from("Payment")
      .select(
        "id, contractId, Contract!inner(parentId, ParentProfile!inner(userId, UserProfile!inner(clerkId)))"
      )
      .eq("id", validated.id)
      .single();

    if (!payment) {
      throw new NotFoundError("Payment");
    }

    const { id, ...updateData } = validated;

    // If status is COMPLETED, set paidAt
    if (updateData.status === "COMPLETED" && !updateData.paidAt) {
      updateData.paidAt = new Date().toISOString();
    }

    const { data: updatedPayment, error } = await supabase
      .from("Payment")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new ValidationError(error.message);
    }

    return { success: true, data: updatedPayment };
  } catch (error) {
    return { success: false, ...handleError(error) };
  }
}

/**
 * Get payments by contract
 */
export async function getPaymentsByContract(contractId: string) {
  try {
    const validated = idSchema.parse(contractId);
    const supabase = getSupabaseAdmin();

    const { data: payments, error } = await supabase
      .from("Payment")
      .select("*")
      .eq("contractId", validated)
      .order("createdAt", { ascending: false });

    if (error) {
      throw new ValidationError(error.message);
    }

    return { success: true, data: payments || [] };
  } catch (error) {
    return { success: false, ...handleError(error) };
  }
}

/**
 * Get payments by parent
 */
export async function getPaymentsByParent(parentId: string) {
  try {
    const validated = idSchema.parse(parentId);
    const supabase = getSupabaseAdmin();

    const { data: payments, error } = await supabase
      .from("Payment")
      .select(
        `
        *,
        Contract:contractId (
          id,
          subject,
          level,
          TeacherProfile:teacherId (
            id,
            UserProfile:userId (
              id,
              firstName,
              lastName
            )
          )
        )
      `
      )
      .eq("Contract.parentId", validated)
      .order("createdAt", { ascending: false });

    if (error) {
      throw new ValidationError(error.message);
    }

    return { success: true, data: payments || [] };
  } catch (error) {
    return { success: false, ...handleError(error) };
  }
}

