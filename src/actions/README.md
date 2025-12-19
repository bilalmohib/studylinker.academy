# Server Actions

This directory contains all server actions for the StudyLinker application. Server actions are organized by domain/feature for better maintainability and scalability.

## Structure

```
src/actions/
├── index.ts                 # Central export point
├── users/
│   └── actions.ts          # User profile management
├── teachers/
│   ├── actions.ts          # Teacher profile CRUD
│   └── subjects.ts         # Teacher subjects & levels
├── parents/
│   └── actions.ts          # Parent profile management
├── students/
│   └── actions.ts          # Student CRUD operations
├── jobs/
│   └── actions.ts          # Job posting CRUD
├── applications/
│   └── actions.ts          # Job application management
├── contracts/
│   └── actions.ts          # Contract management
├── classes/
│   └── actions.ts          # Class/session management
├── reviews/
│   └── actions.ts          # Review/rating operations
├── messages/
│   └── actions.ts          # Messaging/chat operations
└── payments/
    └── actions.ts          # Payment operations
```

## Usage

### Importing Actions

```typescript
// Import specific actions
import { createUserProfile, getUserProfile } from "@/actions/users/actions";

// Or import from central index
import { createJobPosting, searchJobPostings } from "@/actions";
```

### Using in Components

```typescript
"use client";

import { createJobPosting } from "@/actions/jobs/actions";
import { useState } from "react";

export default function PostJobForm() {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    const result = await createJobPosting({
      parentId: formData.get("parentId") as string,
      title: formData.get("title") as string,
      // ... other fields
    });

    if (result.success) {
      // Handle success
    } else {
      // Handle error: result.error, result.code
    }
    setLoading(false);
  }

  return (
    <form action={handleSubmit}>
      {/* Form fields */}
    </form>
  );
}
```

## Response Format

All server actions return a standardized response format:

```typescript
// Success response
{
  success: true,
  data: T, // The actual data
  pagination?: { // Optional for paginated results
    page: number,
    limit: number,
    total: number,
    totalPages: number
  }
}

// Error response
{
  success: false,
  error: string, // Error message
  code: string   // Error code (e.g., "VALIDATION_ERROR", "NOT_FOUND")
}
```

## Error Handling

All actions use standardized error handling:

- `ValidationError` - Invalid input data (400)
- `NotFoundError` - Resource not found (404)
- `UnauthorizedError` - Not authenticated (401)
- `ForbiddenError` - Insufficient permissions (403)
- `DatabaseError` - Database operation failed (500)

## Authentication

All actions that require authentication use Clerk's `auth()` function:

```typescript
import { auth } from "@clerk/nextjs/server";

const { userId } = await auth();
if (!userId) {
  throw new UnauthorizedError();
}
```

## Validation

All inputs are validated using Zod schemas before processing. Invalid data will return a `ValidationError`.

## Database Access

All actions use the Supabase admin client for database operations:

```typescript
import { getSupabaseAdmin } from "@/lib/db/client";

const supabase = getSupabaseAdmin();
```

## Best Practices

1. **Always validate inputs** using Zod schemas
2. **Check authentication** before performing operations
3. **Verify ownership** before updating/deleting resources
4. **Use transactions** for multi-step operations (when needed)
5. **Return standardized responses** for consistent error handling
6. **Handle errors gracefully** and return meaningful messages
7. **Use TypeScript** for type safety
8. **Document complex logic** with comments

## Adding New Actions

1. Create a new file in the appropriate domain folder
2. Use the `"use server"` directive at the top
3. Import required utilities and types
4. Create Zod schemas for validation
5. Implement the action with proper error handling
6. Export from the domain's index file (if applicable)
7. Export from the main `index.ts` file

## Testing

Server actions can be tested by:
1. Calling them directly in test files
2. Using them in form actions
3. Testing error scenarios with invalid inputs
4. Verifying authentication and authorization

