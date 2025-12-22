# Google Meet API Setup Guide

This guide will help you set up Google Workspace API credentials to enable automatic Google Meet meeting creation.

## Prerequisites

- A Google Cloud Platform (GCP) account
- A Google Workspace account (or GCP project with Google Meet API enabled)

## Step-by-Step Setup

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click "New Project"
4. Enter a project name (e.g., "StudyLinker Academy")
5. Click "Create"

### 2. Enable Google Meet API

1. In your Google Cloud project, go to **APIs & Services** > **Library**
2. Search for "Google Meet API"
3. Click on "Google Meet API"
4. Click "Enable"

### 3. Create a Service Account

1. Go to **APIs & Services** > **Credentials**
2. Click "Create Credentials" > "Service Account"
3. Enter a name for the service account (e.g., "studylinker-meet-service")
4. Click "Create and Continue"
5. Skip the optional steps and click "Done"

### 4. Generate Service Account Key

1. In the **Credentials** page, find your service account
2. Click on the service account email
3. Go to the **Keys** tab
4. Click "Add Key" > "Create new key"
5. Select **JSON** format
6. Click "Create" - this will download a JSON file

### 5. Extract Credentials from JSON

Open the downloaded JSON file. You'll need these values:

```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "your-service-account@your-project-id.iam.gserviceaccount.com",
  ...
}
```

### 6. Add to Environment Variables

Add these to your `.env.local` file:

```bash
# Google Meet API (Google Workspace)
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@your-project-id.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
GOOGLE_PROJECT_ID=your-project-id
```

**Important Notes:**
- Keep the `\n` characters in the private key (they represent newlines)
- Wrap the private key in quotes if it contains special characters
- The private key should include the `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` lines

### 7. Grant Domain-Wide Delegation (Optional but Recommended)

For better access control:

1. In the service account details, check "Enable Google Workspace Domain-wide Delegation"
2. Note the Client ID
3. Go to your Google Workspace Admin Console
4. Navigate to **Security** > **API Controls** > **Domain-wide Delegation**
5. Click "Add new" and enter:
   - Client ID: (from step 2)
   - OAuth Scopes: `https://www.googleapis.com/auth/meetings.space.created`

### 8. Restart Your Development Server

After adding the environment variables:

```bash
# Stop your current server (Ctrl+C)
# Then restart it
npm run dev
```

## Troubleshooting

### Error: "Google Workspace API credentials not configured"

- Make sure all three environment variables are set in `.env.local`
- Verify the variable names match exactly (case-sensitive)
- Restart your development server after adding variables

### Error: "Failed to get access token"

- Check that the private key is correctly formatted with `\n` characters
- Verify the service account email matches the one in your JSON file
- Ensure the Google Meet API is enabled in your project

### Error: "Failed to create Google Meet meeting"

- Verify the Google Meet API is enabled
- Check that your service account has the correct permissions
- Ensure domain-wide delegation is set up correctly (if using Google Workspace)

## Testing

After setup, try scheduling an interview:
1. Go to Admin > Teacher Applications
2. Click "Schedule Interview" on a pending application
3. Check "Automatically create Google Meet link"
4. Fill in the interview details and schedule

If successful, you should see a Google Meet link generated automatically!

## Additional Resources

- [Google Meet API Documentation](https://developers.google.com/workspace/meet/api/guides/overview)
- [Google Cloud Service Accounts Guide](https://cloud.google.com/iam/docs/service-accounts)
- [Google Workspace Domain-wide Delegation](https://developers.google.com/identity/protocols/oauth2/service-account#delegatingauthority)

