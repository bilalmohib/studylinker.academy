"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/db/client";
import {
  ValidationError,
  DatabaseError,
  handleError,
} from "@/lib/utils/errors";

/**
 * Schema for creating a contact form submission
 */
const createContactSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name is too long"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(1, "Subject is required").max(255, "Subject is too long"),
  message: z.string().min(10, "Message must be at least 10 characters").max(5000, "Message is too long"),
  phone: z.string().optional(),
});

/**
 * Create a contact form submission
 */
export async function createContactSubmission(
  data: z.infer<typeof createContactSchema>
) {
  try {
    const validated = createContactSchema.parse(data);
    const { userId } = await auth();

    const supabase = getSupabaseAdmin();

    // Get userId from UserProfile if user is logged in
    let userProfileId: string | null = null;
    if (userId) {
      const { data: userProfile } = await (supabase
        .from("UserProfile")
        .select("id")
        .eq("clerkId", userId)
        .single() as unknown as Promise<{ data: { id: string } | null; error: any }>);

      if (userProfile) {
        userProfileId = userProfile.id;
      }
    }

    // Generate ID
    const id = crypto.randomUUID();

    const { data: contact, error } = await (supabase
      .from("Contact")
      .insert({
        id,
        name: validated.name,
        email: validated.email,
        subject: validated.subject,
        message: validated.message,
        phone: validated.phone || null,
        userId: userProfileId,
        status: "NEW",
      } as any)
      .select()
      .single() as unknown as Promise<{ data: any; error: any }>);

    if (error) {
      throw new DatabaseError(error.message);
    }

    return { success: true, data: contact };
  } catch (error) {
    return { success: false, ...handleError(error) };
  }
}

/**
 * Get contact submissions (admin only - for future use)
 */
const idSchema = z.string().uuid("Invalid ID format");

export async function getContactSubmission(id: string) {
  try {
    const validated = idSchema.parse(id);
    const { userId } = await auth();

    if (!userId) {
      throw new Error("Unauthorized");
    }

    const supabase = getSupabaseAdmin();

    const { data: contact, error } = await (supabase
      .from("Contact")
      .select("*")
      .eq("id", validated)
      .single() as unknown as Promise<{ data: any | null; error: any }>);

    if (error) {
      throw new DatabaseError(error.message);
    }

    if (!contact) {
      throw new Error("Contact submission not found");
    }

    return { success: true, data: contact };
  } catch (error) {
    return { success: false, ...handleError(error) };
  }
}

/**
 * Get all contact submissions (admin only - for future use)
 */
export async function getAllContactSubmissions() {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("Unauthorized");
    }

    const supabase = getSupabaseAdmin();

    const { data: contacts, error } = await supabase
      .from("Contact")
      .select("*")
      .order("createdAt", { ascending: false });

    if (error) {
      throw new DatabaseError(error.message);
    }

    return { success: true, data: contacts || [] };
  } catch (error) {
    return { success: false, ...handleError(error) };
  }
}

