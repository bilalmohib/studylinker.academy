-- StudyLinker Database Migration 5
-- Add age and photo fields to TeacherApplication table
-- PostgreSQL Database Schema for Online Tuition Marketplace
-- Compatible with Supabase

-- Add age column to TeacherApplication
ALTER TABLE "TeacherApplication" ADD COLUMN "age" INTEGER;

-- Add photo column to TeacherApplication (URL to photo)
ALTER TABLE "TeacherApplication" ADD COLUMN "photo" TEXT;

-- Add CHECK constraint for age (reasonable range for teachers: 18-100)
ALTER TABLE "TeacherApplication" ADD CONSTRAINT "TeacherApplication_age_check" 
    CHECK ("age" IS NULL OR ("age" >= 18 AND "age" <= 100));

-- Create index for age (useful for filtering/searching)
CREATE INDEX "TeacherApplication_age_idx" ON "TeacherApplication"("age");

