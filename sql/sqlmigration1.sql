-- StudyLinker Database Migration 1
-- PostgreSQL Database Schema for Online Tuition Marketplace
-- Compatible with Supabase

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Profiles (extends Clerk users)
CREATE TABLE "UserProfile" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "avatar" TEXT,
    "role" TEXT NOT NULL DEFAULT 'PARENT',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "UserProfile_clerkId_key" ON "UserProfile"("clerkId");
CREATE UNIQUE INDEX "UserProfile_email_key" ON "UserProfile"("email");
CREATE INDEX "UserProfile_role_idx" ON "UserProfile"("role");

-- Add CHECK constraints for UserProfile
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_role_check" CHECK ("role" IN ('PARENT', 'TEACHER'));

-- Teacher Profile
CREATE TABLE "TeacherProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bio" TEXT,
    "location" TEXT,
    "timezone" TEXT,
    "languages" TEXT[],
    "hourlyRate" DECIMAL(10,2),
    "currency" TEXT DEFAULT 'USD',
    "rating" DECIMAL(3,2) DEFAULT 0,
    "totalReviews" INTEGER NOT NULL DEFAULT 0,
    "totalStudents" INTEGER NOT NULL DEFAULT 0,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "badge" TEXT,
    "availability" JSONB,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT "TeacherProfile_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "TeacherProfile_userId_key" ON "TeacherProfile"("userId");
CREATE INDEX "TeacherProfile_verified_idx" ON "TeacherProfile"("verified");
CREATE INDEX "TeacherProfile_rating_idx" ON "TeacherProfile"("rating");

-- Add CHECK constraints for TeacherProfile
ALTER TABLE "TeacherProfile" ADD CONSTRAINT "TeacherProfile_rating_check" CHECK ("rating" >= 0 AND "rating" <= 5);
ALTER TABLE "TeacherProfile" ADD CONSTRAINT "TeacherProfile_badge_check" CHECK ("badge" IS NULL OR "badge" IN ('TOP_RATED', 'RISING_TALENT', 'VERIFIED', 'PREMIUM'));
ALTER TABLE "TeacherProfile" ADD CONSTRAINT "TeacherProfile_hourlyRate_check" CHECK ("hourlyRate" IS NULL OR "hourlyRate" >= 0);

-- Parent/Student Profile
CREATE TABLE "ParentProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT "ParentProfile_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ParentProfile_userId_key" ON "ParentProfile"("userId");

-- Students (children of parents)
CREATE TABLE "Student" (
    "id" TEXT NOT NULL,
    "parentId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT,
    "age" INTEGER,
    "grade" TEXT,
    "avatar" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Student_parentId_idx" ON "Student"("parentId");

-- Add CHECK constraints for Student
ALTER TABLE "Student" ADD CONSTRAINT "Student_age_check" CHECK ("age" IS NULL OR ("age" >= 3 AND "age" <= 25));

-- Job Postings
CREATE TABLE "JobPosting" (
    "id" TEXT NOT NULL,
    "parentId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "studentAge" INTEGER,
    "hoursPerWeek" TEXT NOT NULL,
    "budget" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "requirements" TEXT[],
    "curriculum" BOOLEAN NOT NULL DEFAULT false,
    "applicationMode" TEXT NOT NULL DEFAULT 'OPEN',
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT "JobPosting_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "JobPosting_parentId_idx" ON "JobPosting"("parentId");
CREATE INDEX "JobPosting_status_idx" ON "JobPosting"("status");
CREATE INDEX "JobPosting_subject_idx" ON "JobPosting"("subject");
CREATE INDEX "JobPosting_level_idx" ON "JobPosting"("level");

-- Add CHECK constraints for JobPosting
ALTER TABLE "JobPosting" ADD CONSTRAINT "JobPosting_status_check" CHECK ("status" IN ('OPEN', 'CLOSED', 'FILLED', 'CANCELLED'));
ALTER TABLE "JobPosting" ADD CONSTRAINT "JobPosting_applicationMode_check" CHECK ("applicationMode" IN ('OPEN', 'CURATED'));
ALTER TABLE "JobPosting" ADD CONSTRAINT "JobPosting_studentAge_check" CHECK ("studentAge" IS NULL OR ("studentAge" >= 3 AND "studentAge" <= 25));

-- Applications (Teachers applying to jobs)
CREATE TABLE "Application" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "proposedRate" DECIMAL(10,2),
    "coverLetter" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Application_jobId_teacherId_key" ON "Application"("jobId", "teacherId");
CREATE INDEX "Application_jobId_idx" ON "Application"("jobId");
CREATE INDEX "Application_teacherId_idx" ON "Application"("teacherId");
CREATE INDEX "Application_status_idx" ON "Application"("status");

-- Add CHECK constraints for Application
ALTER TABLE "Application" ADD CONSTRAINT "Application_status_check" CHECK ("status" IN ('PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN'));
ALTER TABLE "Application" ADD CONSTRAINT "Application_proposedRate_check" CHECK ("proposedRate" IS NULL OR "proposedRate" >= 0);

-- Contracts (Hired teachers)
CREATE TABLE "Contract" (
    "id" TEXT NOT NULL,
    "parentId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "jobId" TEXT,
    "subject" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "rate" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "hoursPerWeek" TEXT NOT NULL,
    "schedule" JSONB,
    "curriculum" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "startDate" TIMESTAMPTZ NOT NULL,
    "endDate" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT "Contract_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Contract_parentId_idx" ON "Contract"("parentId");
CREATE INDEX "Contract_teacherId_idx" ON "Contract"("teacherId");
CREATE INDEX "Contract_studentId_idx" ON "Contract"("studentId");
CREATE INDEX "Contract_status_idx" ON "Contract"("status");

-- Add CHECK constraints for Contract
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_status_check" CHECK ("status" IN ('ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED'));
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_rate_check" CHECK ("rate" > 0);
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_endDate_check" CHECK ("endDate" IS NULL OR "endDate" >= "startDate");

-- Classes/Sessions
CREATE TABLE "Class" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "scheduledAt" TIMESTAMPTZ NOT NULL,
    "duration" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "meetingLink" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT "Class_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Class_contractId_idx" ON "Class"("contractId");
CREATE INDEX "Class_teacherId_idx" ON "Class"("teacherId");
CREATE INDEX "Class_studentId_idx" ON "Class"("studentId");
CREATE INDEX "Class_scheduledAt_idx" ON "Class"("scheduledAt");
CREATE INDEX "Class_status_idx" ON "Class"("status");

-- Add CHECK constraints for Class
ALTER TABLE "Class" ADD CONSTRAINT "Class_status_check" CHECK ("status" IN ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'MISSED'));
ALTER TABLE "Class" ADD CONSTRAINT "Class_duration_check" CHECK ("duration" > 0);

-- Progress Reports
CREATE TABLE "ProgressReport" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "grade" TEXT,
    "attendance" DECIMAL(5,2),
    "performance" JSONB,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT "ProgressReport_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ProgressReport_contractId_idx" ON "ProgressReport"("contractId");
CREATE INDEX "ProgressReport_studentId_idx" ON "ProgressReport"("studentId");
CREATE INDEX "ProgressReport_createdAt_idx" ON "ProgressReport"("createdAt");

-- Add CHECK constraints for ProgressReport
ALTER TABLE "ProgressReport" ADD CONSTRAINT "ProgressReport_attendance_check" CHECK ("attendance" IS NULL OR ("attendance" >= 0 AND "attendance" <= 100));

-- Assessments/Exams
CREATE TABLE "Assessment" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "score" DECIMAL(5,2),
    "maxScore" DECIMAL(5,2) NOT NULL,
    "percentage" DECIMAL(5,2),
    "grade" TEXT,
    "feedback" TEXT,
    "takenAt" TIMESTAMPTZ NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT "Assessment_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Assessment_studentId_idx" ON "Assessment"("studentId");
CREATE INDEX "Assessment_subject_idx" ON "Assessment"("subject");
CREATE INDEX "Assessment_takenAt_idx" ON "Assessment"("takenAt");

-- Add CHECK constraints for Assessment
ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_type_check" CHECK ("type" IN ('QUIZ', 'EXAM', 'ASSIGNMENT', 'PROJECT'));
ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_score_check" CHECK ("score" IS NULL OR ("score" >= 0 AND "score" <= "maxScore"));
ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_maxScore_check" CHECK ("maxScore" > 0);
ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_percentage_check" CHECK ("percentage" IS NULL OR ("percentage" >= 0 AND "percentage" <= 100));

-- Reviews/Ratings
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "parentId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "anonymous" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Review_teacherId_idx" ON "Review"("teacherId");
CREATE INDEX "Review_contractId_idx" ON "Review"("contractId");
CREATE INDEX "Review_rating_idx" ON "Review"("rating");

-- Add CHECK constraints for Review
ALTER TABLE "Review" ADD CONSTRAINT "Review_rating_check" CHECK ("rating" >= 1 AND "rating" <= 5);

-- Messages/Chat
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "contractId" TEXT,
    "content" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Message_senderId_idx" ON "Message"("senderId");
CREATE INDEX "Message_receiverId_idx" ON "Message"("receiverId");
CREATE INDEX "Message_contractId_idx" ON "Message"("contractId");
CREATE INDEX "Message_createdAt_idx" ON "Message"("createdAt");

-- Payments
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "paymentMethod" TEXT,
    "transactionId" TEXT,
    "paidAt" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Payment_transactionId_key" ON "Payment"("transactionId") WHERE "transactionId" IS NOT NULL;
CREATE INDEX "Payment_contractId_idx" ON "Payment"("contractId");
CREATE INDEX "Payment_status_idx" ON "Payment"("status");

-- Add CHECK constraints for Payment
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_status_check" CHECK ("status" IN ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'));
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_amount_check" CHECK ("amount" > 0);

-- Teacher Qualifications
CREATE TABLE "Qualification" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "institution" TEXT,
    "year" INTEGER,
    "certificate" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT "Qualification_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Qualification_teacherId_idx" ON "Qualification"("teacherId");

-- Add CHECK constraints for Qualification
ALTER TABLE "Qualification" ADD CONSTRAINT "Qualification_year_check" CHECK ("year" IS NULL OR ("year" >= 1900 AND "year" <= 2100));

-- Teacher Subjects
CREATE TABLE "TeacherSubject" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "experience" INTEGER,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT "TeacherSubject_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "TeacherSubject_teacherId_subject_key" ON "TeacherSubject"("teacherId", "subject");
CREATE INDEX "TeacherSubject_teacherId_idx" ON "TeacherSubject"("teacherId");
CREATE INDEX "TeacherSubject_subject_idx" ON "TeacherSubject"("subject");

-- Add CHECK constraints for TeacherSubject
ALTER TABLE "TeacherSubject" ADD CONSTRAINT "TeacherSubject_experience_check" CHECK ("experience" IS NULL OR "experience" >= 0);

-- Teacher Levels
CREATE TABLE "TeacherLevel" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT "TeacherLevel_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "TeacherLevel_teacherId_level_key" ON "TeacherLevel"("teacherId", "level");
CREATE INDEX "TeacherLevel_teacherId_idx" ON "TeacherLevel"("teacherId");
CREATE INDEX "TeacherLevel_level_idx" ON "TeacherLevel"("level");

-- Foreign Key Constraints
ALTER TABLE "TeacherProfile" ADD CONSTRAINT "TeacherProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ParentProfile" ADD CONSTRAINT "ParentProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Student" ADD CONSTRAINT "Student_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "ParentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "JobPosting" ADD CONSTRAINT "JobPosting_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "ParentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Application" ADD CONSTRAINT "Application_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "JobPosting"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Application" ADD CONSTRAINT "Application_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "TeacherProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "ParentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "TeacherProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Class" ADD CONSTRAINT "Class_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Class" ADD CONSTRAINT "Class_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "TeacherProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Class" ADD CONSTRAINT "Class_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProgressReport" ADD CONSTRAINT "ProgressReport_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProgressReport" ADD CONSTRAINT "ProgressReport_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "TeacherProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProgressReport" ADD CONSTRAINT "ProgressReport_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Review" ADD CONSTRAINT "Review_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Review" ADD CONSTRAINT "Review_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "ParentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Review" ADD CONSTRAINT "Review_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "TeacherProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Message" ADD CONSTRAINT "Message_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Qualification" ADD CONSTRAINT "Qualification_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "TeacherProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TeacherSubject" ADD CONSTRAINT "TeacherSubject_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "TeacherProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TeacherLevel" ADD CONSTRAINT "TeacherLevel_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "TeacherProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create updated_at trigger function (for Supabase)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at columns
CREATE TRIGGER update_userprofile_updated_at BEFORE UPDATE ON "UserProfile" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_teacherprofile_updated_at BEFORE UPDATE ON "TeacherProfile" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_parentprofile_updated_at BEFORE UPDATE ON "ParentProfile" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_student_updated_at BEFORE UPDATE ON "Student" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_jobposting_updated_at BEFORE UPDATE ON "JobPosting" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_application_updated_at BEFORE UPDATE ON "Application" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contract_updated_at BEFORE UPDATE ON "Contract" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_class_updated_at BEFORE UPDATE ON "Class" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_progressreport_updated_at BEFORE UPDATE ON "ProgressReport" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assessment_updated_at BEFORE UPDATE ON "Assessment" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_review_updated_at BEFORE UPDATE ON "Review" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_message_updated_at BEFORE UPDATE ON "Message" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payment_updated_at BEFORE UPDATE ON "Payment" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_qualification_updated_at BEFORE UPDATE ON "Qualification" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_teachersubject_updated_at BEFORE UPDATE ON "TeacherSubject" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_teacherlevel_updated_at BEFORE UPDATE ON "TeacherLevel" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

