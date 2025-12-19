"use server";

/**
 * Message Server Actions
 * Handles messaging/chat operations
 */

import { getSupabaseAdmin } from "@/lib/db/client";
import {
  handleError,
  NotFoundError,
  ValidationError,
  UnauthorizedError,
} from "@/lib/utils/errors";
import { idSchema, paginationSchema } from "@/lib/utils/validation";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";

const createMessageSchema = z.object({
  senderId: idSchema,
  receiverId: idSchema,
  contractId: idSchema.optional().nullable(),
  content: z.string().min(1, "Message content is required"),
});

/**
 * Send a message
 */
export async function sendMessage(
  data: z.infer<typeof createMessageSchema>
) {
  try {
    const validated = createMessageSchema.parse(data);
    const { userId } = await auth();

    if (!userId) {
      throw new UnauthorizedError();
    }

    const supabase = getSupabaseAdmin();

    // Verify sender
    const { data: sender } = await supabase
      .from("UserProfile")
      .select("id, clerkId")
      .eq("id", validated.senderId)
      .single();

    if (!sender || sender.clerkId !== userId) {
      throw new UnauthorizedError();
    }

    const { data: message, error } = await supabase
      .from("Message")
      .insert({
        id: crypto.randomUUID(),
        ...validated,
        read: false,
      })
      .select()
      .single();

    if (error) {
      throw new ValidationError(error.message);
    }

    return { success: true, data: message };
  } catch (error) {
    return { success: false, ...handleError(error) };
  }
}

/**
 * Get messages between two users
 */
export async function getMessagesBetweenUsers(
  userId1: string,
  userId2: string,
  pagination?: z.infer<typeof paginationSchema>
) {
  try {
    const validated1 = idSchema.parse(userId1);
    const validated2 = idSchema.parse(userId2);
    const { userId } = await auth();

    if (!userId) {
      throw new UnauthorizedError();
    }

    const supabase = getSupabaseAdmin();

    // Verify user is one of the participants
    const { data: user } = await supabase
      .from("UserProfile")
      .select("id, clerkId")
      .eq("clerkId", userId)
      .single();

    if (!user || (user.id !== validated1 && user.id !== validated2)) {
      throw new UnauthorizedError();
    }

    let query = supabase
      .from("Message")
      .select("*", { count: "exact" })
      .or(
        `and(senderId.eq.${validated1},receiverId.eq.${validated2}),and(senderId.eq.${validated2},receiverId.eq.${validated1})`
      )
      .order("createdAt", { ascending: false });

    if (pagination) {
      const page = pagination.page || 1;
      const limit = pagination.limit || 50;
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);
    }

    const { data: messages, error, count } = await query;

    if (error) {
      throw new ValidationError(error.message);
    }

    return {
      success: true,
      data: messages || [],
      pagination: pagination
        ? {
            page: pagination.page || 1,
            limit: pagination.limit || 50,
            total: count || 0,
            totalPages: Math.ceil((count || 0) / (pagination.limit || 50)),
          }
        : undefined,
    };
  } catch (error) {
    return { success: false, ...handleError(error) };
  }
}

/**
 * Mark message as read
 */
export async function markMessageAsRead(messageId: string) {
  try {
    const validated = idSchema.parse(messageId);
    const { userId } = await auth();

    if (!userId) {
      throw new UnauthorizedError();
    }

    const supabase = getSupabaseAdmin();

    // Verify user is receiver
    const { data: message } = await supabase
      .from("Message")
      .select("receiverId, UserProfile!receiverId(clerkId)")
      .eq("id", validated)
      .single();

    if (!message) {
      throw new NotFoundError("Message");
    }

    const { data: updatedMessage, error } = await supabase
      .from("Message")
      .update({
        read: true,
        readAt: new Date().toISOString(),
      })
      .eq("id", validated)
      .select()
      .single();

    if (error) {
      throw new ValidationError(error.message);
    }

    return { success: true, data: updatedMessage };
  } catch (error) {
    return { success: false, ...handleError(error) };
  }
}

/**
 * Get unread message count for user
 */
export async function getUnreadMessageCount(userId: string) {
  try {
    const validated = idSchema.parse(userId);
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      throw new UnauthorizedError();
    }

    const supabase = getSupabaseAdmin();

    // Verify user
    const { data: user } = await supabase
      .from("UserProfile")
      .select("id, clerkId")
      .eq("id", validated)
      .single();

    if (!user || user.clerkId !== clerkUserId) {
      throw new UnauthorizedError();
    }

    const { count, error } = await supabase
      .from("Message")
      .select("*", { count: "exact", head: true })
      .eq("receiverId", validated)
      .eq("read", false);

    if (error) {
      throw new ValidationError(error.message);
    }

    return { success: true, count: count || 0 };
  } catch (error) {
    return { success: false, ...handleError(error) };
  }
}

