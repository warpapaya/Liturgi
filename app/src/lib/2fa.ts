import * as OTPAuth from 'otpauth';
import crypto from 'crypto';
import QRCode from 'qrcode';

export interface TwoFactorSetup {
  secret: string;
  qrCode: string;
  backupCodes: string[];
  otpauthUrl: string;
}

// Generate 2FA secret and QR code
export async function generate2FASecret(
  userEmail: string,
  orgName: string
): Promise<TwoFactorSetup> {
  // Generate a random secret
  const secret = new OTPAuth.Secret({ size: 20 }).base32;

  // Create TOTP instance
  const totp = new OTPAuth.TOTP({
    issuer: orgName || 'Liturgi',
    label: userEmail,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret,
  });

  // Generate otpauth URL for QR code
  const otpauthUrl = totp.toString();

  // Generate QR code as data URL
  const qrCode = await QRCode.toDataURL(otpauthUrl);

  // Generate backup codes
  const backupCodes = generateBackupCodes(10);

  return {
    secret,
    qrCode,
    backupCodes,
    otpauthUrl,
  };
}

// Verify TOTP code
export function verify2FACode(secret: string, code: string): boolean {
  try {
    const totp = new OTPAuth.TOTP({
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret,
    });

    // Verify with a window of ±1 period (30 seconds) to account for clock drift
    const delta = totp.validate({ token: code, window: 1 });
    return delta !== null;
  } catch (error) {
    console.error('Error verifying 2FA code:', error);
    return false;
  }
}

// Generate backup codes
export function generateBackupCodes(count: number = 10): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    codes.push(code);
  }
  return codes;
}

// Hash backup codes for storage
export function hashBackupCodes(codes: string[]): string[] {
  return codes.map((code) => {
    return crypto.createHash('sha256').update(code).digest('hex');
  });
}

// Verify backup code against hashed codes
export function verifyBackupCode(
  code: string,
  hashedCodes: string[]
): { valid: boolean; remainingCodes: string[] } {
  const hashedCode = crypto.createHash('sha256').update(code).digest('hex');
  const index = hashedCodes.indexOf(hashedCode);

  if (index === -1) {
    return { valid: false, remainingCodes: hashedCodes };
  }

  // Remove used code
  const remainingCodes = hashedCodes.filter((_, i) => i !== index);
  return { valid: true, remainingCodes };
}

// Send 2FA code via SMS (placeholder - requires Twilio or similar)
export async function send2FACodeSMS(
  phoneNumber: string,
  code: string
): Promise<boolean> {
  // TODO: Implement SMS sending with Twilio
  console.log(`SMS 2FA code for ${phoneNumber}: ${code}`);
  return true;
}

// Send 2FA code via email
export async function send2FACodeEmail(
  email: string,
  code: string,
  orgId: string
): Promise<boolean> {
  // Import dynamically to avoid circular dependency
  const { sendEmail } = await import('./email');

  return await sendEmail(
    {
      to: email,
      subject: 'Your Login Verification Code',
      html: `
        <h2>Login Verification</h2>
        <p>Your verification code is: <strong>${code}</strong></p>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this code, please ignore this email and secure your account.</p>
      `,
      text: `
        Login Verification

        Your verification code is: ${code}

        This code will expire in 10 minutes.

        If you didn't request this code, please ignore this email and secure your account.
      `,
    },
    orgId
  );
}

// Generate a temporary 2FA code (for email/SMS)
export function generateTemporary2FACode(): string {
  return crypto.randomInt(100000, 999999).toString();
}
