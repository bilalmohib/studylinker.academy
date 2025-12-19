/**
 * Validation Utilities
 * Common validation schemas and helpers
 */

import { z } from "zod";

// Common validation schemas
export const idSchema = z.string().min(1, "ID is required");

export const emailSchema = z
  .string()
  .email("Invalid email address")
  .min(1, "Email is required");

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const dateRangeSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

// User role enum
export const userRoleSchema = z.enum(["PARENT", "TEACHER"]);

// Job status enum
export const jobStatusSchema = z.enum([
  "OPEN",
  "CLOSED",
  "FILLED",
  "CANCELLED",
]);

// Application status enum
export const applicationStatusSchema = z.enum([
  "PENDING",
  "ACCEPTED",
  "REJECTED",
  "WITHDRAWN",
]);

// Contract status enum
export const contractStatusSchema = z.enum([
  "ACTIVE",
  "PAUSED",
  "COMPLETED",
  "CANCELLED",
]);

// Class status enum
export const classStatusSchema = z.enum([
  "SCHEDULED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
  "MISSED",
]);

// Payment status enum
export const paymentStatusSchema = z.enum([
  "PENDING",
  "COMPLETED",
  "FAILED",
  "REFUNDED",
]);

// Assessment type enum
export const assessmentTypeSchema = z.enum([
  "QUIZ",
  "EXAM",
  "ASSIGNMENT",
  "PROJECT",
]);

