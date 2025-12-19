-- Set Admin Role for a User
-- Replace 'YOUR_CLERK_USER_ID' with the actual Clerk user ID from Clerk dashboard

-- Option 1: Update by Clerk ID (recommended)
UPDATE "UserProfile"
SET "role" = 'ADMIN'
WHERE "clerkId" = 'YOUR_CLERK_USER_ID';

-- Option 2: Update by Email
UPDATE "UserProfile"
SET "role" = 'ADMIN'
WHERE "email" = 'your-email@example.com';

-- Option 3: Update by UserProfile ID
UPDATE "UserProfile"
SET "role" = 'ADMIN'
WHERE "id" = 'YOUR_USER_PROFILE_ID';

-- Verify the update
SELECT id, "clerkId", email, "firstName", "lastName", role
FROM "UserProfile"
WHERE "role" IN ('ADMIN', 'MANAGER');

