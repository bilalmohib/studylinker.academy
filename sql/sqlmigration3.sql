-- StudyLinker Database Migration 3
-- Teacher Application System with Interview and Scoring
-- PostgreSQL Database Schema for Online Tuition Marketplace
-- Compatible with Supabase

-- Teacher Applications (for teachers applying to join the platform)
CREATE TABLE "TeacherApplication" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subjects" TEXT[] NOT NULL,
    "levels" TEXT[] NOT NULL,
    "qualifications" JSONB,
    "experience" TEXT,
    "resume" TEXT,
    "certificates" TEXT[],
    "coverLetter" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "interviewScheduledAt" TIMESTAMPTZ,
    "interviewLink" TEXT,
    "interviewNotes" TEXT,
    "interviewScore" DECIMAL(5,2),
    "maxInterviewScore" DECIMAL(5,2) DEFAULT 100,
    "adminNotes" TEXT,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMPTZ,
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT "TeacherApplication_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "TeacherApplication_userId_key" ON "TeacherApplication"("userId");
CREATE INDEX "TeacherApplication_status_idx" ON "TeacherApplication"("status");
CREATE INDEX "TeacherApplication_createdAt_idx" ON "TeacherApplication"("createdAt");
CREATE INDEX "TeacherApplication_reviewedBy_idx" ON "TeacherApplication"("reviewedBy");

-- Add CHECK constraints for TeacherApplication
ALTER TABLE "TeacherApplication" ADD CONSTRAINT "TeacherApplication_status_check" 
    CHECK ("status" IN ('PENDING', 'UNDER_REVIEW', 'INTERVIEW_SCHEDULED', 'INTERVIEW_COMPLETED', 'APPROVED', 'REJECTED'));
ALTER TABLE "TeacherApplication" ADD CONSTRAINT "TeacherApplication_interviewScore_check" 
    CHECK ("interviewScore" IS NULL OR ("interviewScore" >= 0 AND "interviewScore" <= "maxInterviewScore"));
ALTER TABLE "TeacherApplication" ADD CONSTRAINT "TeacherApplication_maxInterviewScore_check" 
    CHECK ("maxInterviewScore" > 0);

-- Foreign Key Constraints
ALTER TABLE "TeacherApplication" ADD CONSTRAINT "TeacherApplication_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TeacherApplication" ADD CONSTRAINT "TeacherApplication_reviewedBy_fkey" 
    FOREIGN KEY ("reviewedBy") REFERENCES "UserProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Add trigger for updated_at column
CREATE TRIGGER update_teacherapplication_updated_at 
    BEFORE UPDATE ON "TeacherApplication" 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add admin role to UserProfile (update existing constraint)
-- First, drop the old constraint if it exists
ALTER TABLE "UserProfile" DROP CONSTRAINT IF EXISTS "UserProfile_role_check";
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_role_check" 
    CHECK ("role" IN ('PARENT', 'TEACHER', 'ADMIN', 'MANAGER'));

