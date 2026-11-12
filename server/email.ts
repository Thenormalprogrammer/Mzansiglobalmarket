// Email service for notifications
export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  // Using Resend API through environment variables
  const resendApiKey = process.env.RESEND_API_KEY;
  
  if (!resendApiKey) {
    console.log("Email service not configured (RESEND_API_KEY missing). Email would be sent to:", options.to);
    console.log("Subject:", options.subject);
    return;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "noreply@marketplace.local",
        to: options.to,
        subject: options.subject,
        html: options.html,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Failed to send email:", error);
    }
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

export function generateRFQNotificationEmail(
  supplierName: string,
  productName: string,
  quantity: string,
  category: string,
): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>New Quote Request!</h2>
      <p>Dear ${supplierName},</p>
      <p>You have received a new request for quotation on MzansiGlobalMarket:</p>
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Product:</strong> ${productName}</p>
        <p><strong>Category:</strong> ${category}</p>
        <p><strong>Quantity Required:</strong> ${quantity}</p>
      </div>
      <p>
        <a href="https://marketplace.local/rfq" style="background-color: #16a34a; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">
          View Quote Request
        </a>
      </p>
      <p>Best regards,<br/>MzansiGlobalMarket Team</p>
    </div>
  `;
}

export function generateMessageNotificationEmail(
  supplierName: string,
  senderName: string,
  subject: string,
  messagePreview: string,
): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #1A5A2E; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">MzansiGlobalMarket</h1>
      </div>
      <div style="padding: 20px;">
        <h2 style="color: #1A5A2E;">You Have a New Message!</h2>
        <p>Dear ${supplierName},</p>
        <p>You have received a new message from a potential buyer on MzansiGlobalMarket:</p>
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #FF6B35;">
          <p><strong>From:</strong> ${senderName}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Message:</strong></p>
          <p style="font-style: italic;">"${messagePreview.substring(0, 200)}${messagePreview.length > 200 ? '...' : ''}"</p>
        </div>
        <p>
          <a href="https://marketplace.local/messages" style="background-color: #1A5A2E; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            View Full Message
          </a>
        </p>
        <p style="color: #666; font-size: 14px; margin-top: 30px;">
          Don't miss out on potential business opportunities. Log in to respond to this inquiry.
        </p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
        <p style="color: #888; font-size: 12px;">
          Best regards,<br/>MzansiGlobalMarket Team
        </p>
      </div>
    </div>
  `;
}

export function generateVerificationCodeEmail(name: string, code: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #1A5A2E; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">MzansiGlobalMarket</h1>
      </div>
      <div style="padding: 20px;">
        <h2 style="color: #1A5A2E;">Verify Your Email Address</h2>
        <p>Dear ${name},</p>
        <p>Thank you for registering with MzansiGlobalMarket. Please use the verification code below to complete your registration:</p>
        <div style="background-color: #f5f5f5; padding: 30px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <p style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1A5A2E; margin: 0;">${code}</p>
        </div>
        <p style="color: #666; font-size: 14px;">This code will expire in 15 minutes.</p>
        <p style="color: #666; font-size: 14px;">If you didn't request this verification code, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
        <p style="color: #888; font-size: 12px;">
          Best regards,<br/>MzansiGlobalMarket Team
        </p>
      </div>
    </div>
  `;
}

export function generateSupplierVerificationEmail(
  supplierName: string,
  isApproved: boolean,
  notes?: string
): string {
  const statusColor = isApproved ? "#1A5A2E" : "#dc2626";
  const statusText = isApproved ? "Approved" : "Rejected";
  const statusMessage = isApproved 
    ? "Congratulations! Your supplier account has been verified. You can now list products on MzansiGlobalMarket."
    : "Unfortunately, your supplier verification request has been rejected.";

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #1A5A2E; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">MzansiGlobalMarket</h1>
      </div>
      <div style="padding: 20px;">
        <h2 style="color: ${statusColor};">Supplier Verification: ${statusText}</h2>
        <p>Dear ${supplierName},</p>
        <p>${statusMessage}</p>
        ${notes ? `
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${statusColor};">
          <p><strong>Notes from our team:</strong></p>
          <p>${notes}</p>
        </div>
        ` : ''}
        ${isApproved ? `
        <p>
          <a href="https://marketplace.local/vendor/dashboard" style="background-color: #1A5A2E; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Go to Your Dashboard
          </a>
        </p>
        ` : `
        <p>
          <a href="https://marketplace.local/vendor/verification" style="background-color: #FF6B35; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Resubmit Documents
          </a>
        </p>
        `}
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
        <p style="color: #888; font-size: 12px;">
          Best regards,<br/>MzansiGlobalMarket Team
        </p>
      </div>
    </div>
  `;
}

// Generate a 6-digit verification code
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function generatePasswordResetEmail(name: string, code: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #1A5A2E; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">MzansiGlobalMarket</h1>
      </div>
      <div style="padding: 20px;">
        <h2 style="color: #1A5A2E;">Reset Your Password</h2>
        <p>Dear ${name},</p>
        <p>We received a request to reset your password. Use the code below to reset your password:</p>
        <div style="background-color: #f5f5f5; padding: 30px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <p style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #FF6B35; margin: 0;">${code}</p>
        </div>
        <p style="color: #666; font-size: 14px;">This code will expire in 15 minutes.</p>
        <p style="color: #666; font-size: 14px;">If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
        <p style="color: #888; font-size: 12px;">
          Best regards,<br/>MzansiGlobalMarket Team
        </p>
      </div>
    </div>
  `;
}
