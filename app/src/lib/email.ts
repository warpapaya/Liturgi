import nodemailer from 'nodemailer';
import prisma from './prisma';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
}

// Get SMTP transporter for an organization
async function getTransporter(orgId?: string) {
  let smtpConfig: any = null;

  // If orgId provided, get org-specific SMTP settings
  if (orgId) {
    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      select: { smtpSettings: true, emailFromAddress: true, emailFromName: true },
    });

    if (org?.smtpSettings) {
      smtpConfig = org.smtpSettings as any;
    }
  }

  // Fall back to default SMTP settings from environment
  if (!smtpConfig) {
    smtpConfig = {
      host: process.env.SMTP_HOST || 'localhost',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: process.env.SMTP_USER
        ? {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
          }
        : undefined,
    };
  }

  return nodemailer.createTransporter(smtpConfig);
}

// Send email
export async function sendEmail(options: EmailOptions, orgId?: string): Promise<boolean> {
  try {
    const transporter = await getTransporter(orgId);

    // Get sender email and name
    let fromAddress = options.from || process.env.EMAIL_FROM || 'noreply@liturgi.app';
    let fromName = 'Liturgi';

    if (orgId) {
      const org = await prisma.organization.findUnique({
        where: { id: orgId },
        select: { emailFromAddress: true, emailFromName: true, name: true },
      });

      if (org) {
        fromAddress = org.emailFromAddress || fromAddress;
        fromName = org.emailFromName || org.name;
      }
    }

    const from = `${fromName} <${fromAddress}>`;

    await transporter.sendMail({
      from,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
      replyTo: options.replyTo,
    });

    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

// Send email from template
export async function sendTemplateEmail(
  orgId: string,
  templateName: string,
  to: string,
  variables: Record<string, any>
): Promise<boolean> {
  try {
    // Get email template
    const template = await prisma.emailTemplate.findUnique({
      where: {
        orgId_name: {
          orgId,
          name: templateName,
        },
      },
    });

    if (!template || !template.isActive) {
      console.error(`Email template not found: ${templateName}`);
      return false;
    }

    // Replace variables in subject and body
    let subject = template.subject;
    let htmlBody = template.htmlBody;
    let textBody = template.textBody || '';

    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = new RegExp(`{{${key}}}`, 'g');
      subject = subject.replace(placeholder, String(value));
      htmlBody = htmlBody.replace(placeholder, String(value));
      textBody = textBody.replace(placeholder, String(value));
    });

    return await sendEmail(
      {
        to,
        subject,
        html: htmlBody,
        text: textBody,
      },
      orgId
    );
  } catch (error) {
    console.error('Error sending template email:', error);
    return false;
  }
}

// Queue notification for later sending
export async function queueNotification(data: {
  orgId: string;
  type: 'assignment_created' | 'assignment_reminder' | 'service_updated' | 'conflict_detected';
  recipientEmail: string;
  recipientName?: string;
  subject: string;
  body: string;
  servicePlanId?: string;
  assignmentId?: string;
  scheduledFor?: Date;
}): Promise<void> {
  await prisma.notification.create({
    data: {
      orgId: data.orgId,
      type: data.type,
      recipientEmail: data.recipientEmail,
      recipientName: data.recipientName,
      subject: data.subject,
      body: data.body,
      servicePlanId: data.servicePlanId,
      assignmentId: data.assignmentId,
      scheduledFor: data.scheduledFor || new Date(),
      status: 'pending',
    },
  });
}

// Process pending notifications (to be called by a cron job or background worker)
export async function processPendingNotifications(): Promise<void> {
  const pendingNotifications = await prisma.notification.findMany({
    where: {
      status: 'pending',
      scheduledFor: {
        lte: new Date(),
      },
    },
    take: 100, // Process in batches
  });

  for (const notification of pendingNotifications) {
    try {
      const success = await sendEmail(
        {
          to: notification.recipientEmail,
          subject: notification.subject,
          html: notification.body,
        },
        notification.orgId
      );

      await prisma.notification.update({
        where: { id: notification.id },
        data: {
          status: success ? 'sent' : 'failed',
          sentAt: success ? new Date() : null,
          error: success ? null : 'Failed to send email',
        },
      });
    } catch (error) {
      console.error(`Error processing notification ${notification.id}:`, error);
      await prisma.notification.update({
        where: { id: notification.id },
        data: {
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    }
  }
}
