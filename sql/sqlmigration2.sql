-- StudyLinker Database Migration 2
-- Contact Form Submissions Table
-- PostgreSQL Database Schema for Online Tuition Marketplace
-- Compatible with Supabase

-- Contact Form Submissions
CREATE TABLE "Contact" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "phone" TEXT,
    "userId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "respondedAt" TIMESTAMPTZ,
    "response" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Contact_email_idx" ON "Contact"("email");
CREATE INDEX "Contact_userId_idx" ON "Contact"("userId");
CREATE INDEX "Contact_status_idx" ON "Contact"("status");
CREATE INDEX "Contact_createdAt_idx" ON "Contact"("createdAt");

-- Add CHECK constraints for Contact
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_status_check" CHECK ("status" IN ('NEW', 'READ', 'IN_PROGRESS', 'RESOLVED', 'ARCHIVED'));

-- Add foreign key constraint if userId is provided
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Add trigger for updated_at column
CREATE TRIGGER update_contact_updated_at BEFORE UPDATE ON "Contact" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

