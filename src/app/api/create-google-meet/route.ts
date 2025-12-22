import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

/**
 * Create a Google Meet meeting space
 * Requires Google Workspace OAuth2 credentials
 * Documentation: https://developers.google.com/workspace/meet/api/guides/overview
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { meetingTitle, startTime } = await request.json();

    // Google Workspace API credentials
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, "\n");
    const projectId = process.env.GOOGLE_PROJECT_ID;

    if (!clientEmail || !privateKey || !projectId) {
      const missingVars = [];
      if (!clientEmail) missingVars.push("GOOGLE_SERVICE_ACCOUNT_EMAIL");
      if (!privateKey) missingVars.push("GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY");
      if (!projectId) missingVars.push("GOOGLE_PROJECT_ID");
      
      return NextResponse.json(
        { 
          error: "Google Workspace API credentials not configured",
          message: `Missing environment variables: ${missingVars.join(", ")}`,
          setupGuide: "See GOOGLE_MEET_SETUP.md for setup instructions"
        },
        { status: 500 }
      );
    }

    // Get access token using service account
    const accessToken = await getAccessToken(clientEmail, privateKey);

    // Create meeting space
    const meetingResponse = await fetch(
      "https://meet.googleapis.com/v1/spaces",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          config: {
            accessType: "OPEN",
            entryPointAccess: "CREATOR_APP_ONLY",
          },
          ...(meetingTitle && { spaceConfig: { name: meetingTitle } }),
        }),
      }
    );

    if (!meetingResponse.ok) {
      const errorData = await meetingResponse.json();
      console.error("Google Meet API error:", errorData);
      return NextResponse.json(
        { error: "Failed to create Google Meet meeting", details: errorData },
        { status: meetingResponse.status }
      );
    }

    const meetingData = await meetingResponse.json();

    // Extract meeting URI from the response
    const meetingUri = meetingData.meetingUri || meetingData.meetingCode 
      ? `https://meet.google.com/${meetingData.meetingCode || meetingData.meetingUri.split("/").pop()}`
      : null;

    return NextResponse.json({
      meetingUri: meetingUri || meetingData.meetingUri,
      meetingCode: meetingData.meetingCode,
      meetingId: meetingData.name,
      ...meetingData,
    });
  } catch (error) {
    console.error("Error creating Google Meet meeting:", error);
    return NextResponse.json(
      { error: "Failed to create Google Meet meeting", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

/**
 * Get OAuth2 access token using service account
 * Uses Web Crypto API (available in Node.js 18+)
 */
async function getAccessToken(clientEmail: string, privateKey: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  
  // Create JWT header
  const header = {
    alg: "RS256",
    typ: "JWT",
  };

  // Create JWT payload
  const payload = {
    iss: clientEmail,
    sub: clientEmail,
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
    scope: "https://www.googleapis.com/auth/meetings.space.created",
  };

  // Encode header and payload
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;

  // Import private key
  const key = await crypto.subtle.importKey(
    "pkcs8",
    pemToArrayBuffer(privateKey),
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: "SHA-256",
    },
    false,
    ["sign"]
  );

  // Sign the token
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(unsignedToken)
  );

  // Encode signature
  const encodedSignature = base64UrlEncode(signature);
  const jwt = `${unsignedToken}.${encodedSignature}`;

  // Exchange JWT for access token
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get access token: ${error}`);
  }

  const data = await response.json();
  return data.access_token;
}

/**
 * Base64 URL encode
 */
function base64UrlEncode(data: string | ArrayBuffer): string {
  let base64: string;
  if (typeof data === "string") {
    base64 = Buffer.from(data, "utf-8").toString("base64");
  } else {
    base64 = Buffer.from(data).toString("base64");
  }
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

/**
 * Convert PEM key to ArrayBuffer
 */
function pemToArrayBuffer(pem: string): ArrayBuffer {
  const base64 = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\s/g, "");
  const binary = Buffer.from(base64, "base64");
  return binary.buffer.slice(binary.byteOffset, binary.byteOffset + binary.byteLength);
}

