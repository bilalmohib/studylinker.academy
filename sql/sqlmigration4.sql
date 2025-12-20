-- StudyLinker Database Migration 4
-- Add isAdmin column to UserProfile table
-- PostgreSQL Database Schema for Online Tuition Marketplace
-- Compatible with Supabase

-- Add isAdmin column to UserProfile table
ALTER TABLE "UserProfile" 
ADD COLUMN IF NOT EXISTS "isAdmin" BOOLEAN NOT NULL DEFAULT FALSE;

-- Create index for faster admin lookups
CREATE INDEX IF NOT EXISTS "UserProfile_isAdmin_idx" ON "UserProfile"("isAdmin");

-- Update existing users with role 'ADMIN' or 'MANAGER' to have isAdmin = true
UPDATE "UserProfile" 
SET "isAdmin" = TRUE 
WHERE "role" IN ('ADMIN', 'MANAGER');

