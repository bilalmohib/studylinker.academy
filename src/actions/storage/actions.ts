"use server";

/**
 * Storage Server Actions
 * Handles file uploads to Supabase Storage
 */

import { getSupabaseAdmin } from "@/lib/db/client";
import { auth } from "@clerk/nextjs/server";
import {
  handleError,
  UnauthorizedError,
  ValidationError,
} from "@/lib/utils/errors";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024; // 10MB for documents
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const ALLOWED_DOCUMENT_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];

/**
 * Upload a file to Supabase Storage
 * @param file - File to upload (as FormData)
 * @param bucket - Storage bucket name (default: 'teacher-photos')
 * @param folder - Folder path within bucket (optional)
 * @returns Public URL of uploaded file
 */
export async function uploadFile(
  file: File,
  bucket: string = "teacher-photos",
  folder?: string,
  isDocument: boolean = false
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new UnauthorizedError("You must be logged in to upload files");
    }

    // Validate file
    if (!file) {
      throw new ValidationError("No file provided");
    }

    const maxSize = isDocument ? MAX_DOCUMENT_SIZE : MAX_FILE_SIZE;
    const allowedTypes = isDocument ? ALLOWED_DOCUMENT_TYPES : ALLOWED_FILE_TYPES;

    if (file.size > maxSize) {
      throw new ValidationError(
        `File size exceeds maximum allowed size of ${maxSize / 1024 / 1024}MB`
      );
    }

    if (!allowedTypes.includes(file.type)) {
      throw new ValidationError(
        `Invalid file type. Allowed types: ${allowedTypes.join(", ")}`
      );
    }

    const supabase = getSupabaseAdmin();

    // Generate unique filename
    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = folder ? `${folder}/${fileName}` : fileName;

    // Convert File to ArrayBuffer for upload
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, uint8Array, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      throw new ValidationError(`Failed to upload file: ${error.message}`);
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(filePath);

    return {
      success: true,
      url: publicUrl,
      path: filePath,
    };
  } catch (error) {
    return handleError(error);
  }
}

/**
 * Delete a file from Supabase Storage
 * @param filePath - Path to file in storage
 * @param bucket - Storage bucket name (default: 'teacher-photos')
 */
export async function deleteFile(
  filePath: string,
  bucket: string = "teacher-photos"
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new UnauthorizedError("You must be logged in to delete files");
    }

    // Verify the file belongs to the user (security check)
    if (!filePath.startsWith(`${userId}/`)) {
      throw new UnauthorizedError("You can only delete your own files");
    }

    const supabase = getSupabaseAdmin();

    const { error } = await supabase.storage.from(bucket).remove([filePath]);

    if (error) {
      throw new ValidationError(`Failed to delete file: ${error.message}`);
    }

    return {
      success: true,
    };
  } catch (error) {
    return handleError(error);
  }
}

