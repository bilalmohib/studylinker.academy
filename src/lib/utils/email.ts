/**
 * Email utility functions
 * Sends emails using various providers (Resend, SendGrid, or SMTP)
 */

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

/**
 * Send email using configured email service
 */
export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; error?: string }> {
  const emailProvider = process.env.EMAIL_PROVIDER || "resend";

  try {
    switch (emailProvider) {
      case "resend":
        return await sendEmailViaResend(options);
      case "sendgrid":
        return await sendEmailViaSendGrid(options);
      case "smtp":
        return await sendEmailViaSMTP(options);
      default:
        // Fallback: Log email content (for development)
        console.log("Email would be sent:", options);
        return { success: true };
    }
  } catch (error) {
    console.error("Error sending email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send email via Resend
 */
async function sendEmailViaResend(options: EmailOptions) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: options.from || process.env.EMAIL_FROM || "StudyLinker <noreply@studylinker.academy>",
      to: options.to,
      subject: options.subject,
      html: options.html,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Resend API error: ${JSON.stringify(error)}`);
  }

  return { success: true };
}

/**
 * Send email via SendGrid
 */
async function sendEmailViaSendGrid(options: EmailOptions) {
  const apiKey = process.env.SENDGRID_API_KEY;

  if (!apiKey) {
    throw new Error("SENDGRID_API_KEY is not configured");
  }

  const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [
        {
          to: [{ email: options.to }],
        },
      ],
      from: {
        email: options.from || process.env.EMAIL_FROM || "noreply@studylinker.academy",
        name: "StudyLinker",
      },
      subject: options.subject,
      content: [
        {
          type: "text/html",
          value: options.html,
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`SendGrid API error: ${error}`);
  }

  return { success: true };
}

/**
 * Send email via SMTP (using nodemailer)
 */
async function sendEmailViaSMTP(options: EmailOptions): Promise<{ success: boolean; error?: string }> {
  // This would require nodemailer package
  // For now, we'll return an error suggesting to use Resend or SendGrid
  return {
    success: false,
    error: "SMTP email sending requires nodemailer package. Please use Resend or SendGrid instead, or install nodemailer: npm install nodemailer"
  };
}

/**
 * Generate HTML email template for interview invitation
 */
export function generateInterviewInvitationEmail(
  teacherName: string,
  interviewDate: string,
  meetingLink: string,
  meetingDescription?: string
): string {
  const formattedDate = new Date(interviewDate).toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Interview Invitation - StudyLinker Academy</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">StudyLinker Academy</h1>
      </div>
      
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <h2 style="color: #667eea; margin-top: 0;">Interview Invitation</h2>
        
        <p>Dear ${teacherName},</p>
        
        <p>We are pleased to invite you for an interview with StudyLinker Academy. We were impressed with your application and would like to learn more about your teaching experience and qualifications.</p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
          <p style="margin: 0 0 10px 0;"><strong>📅 Interview Date & Time:</strong></p>
          <p style="margin: 0; font-size: 18px; color: #667eea;">${formattedDate}</p>
        </div>
        
        ${meetingDescription ? `
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0 0 10px 0;"><strong>📋 Interview Details:</strong></p>
          <p style="margin: 0; color: #666;">${meetingDescription.replace(/\n/g, "<br>")}</p>
        </div>
        ` : ""}
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${meetingLink}" 
             style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
            Join Google Meet Interview
          </a>
        </div>
        
        <p style="color: #666; font-size: 14px;">
          <strong>Meeting Link:</strong><br>
          <a href="${meetingLink}" style="color: #667eea; word-break: break-all;">${meetingLink}</a>
        </p>
        
        <p>Please ensure you have a stable internet connection and a quiet environment for the interview. We look forward to speaking with you!</p>
        
        <p>Best regards,<br>
        <strong>The StudyLinker Academy Team</strong></p>
      </div>
      
      <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
        <p>This is an automated email from StudyLinker Academy. Please do not reply to this email.</p>
      </div>
    </body>
    </html>
  `;
}

