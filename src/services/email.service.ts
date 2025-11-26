// src/services/email.service.ts
interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export const emailService = {
  /**
   * Sends an email (mocked for MVP).
   * In a real application, this would integrate with a service like SendGrid or AWS SES.
   * @param options The email options.
   */
  async sendEmail(options: EmailOptions): Promise<void> {
    console.log(`
      --- Mock Email Sent ---
      To: ${options.to}
      Subject: ${options.subject}
      Text: ${options.text}
      HTML: ${options.html || '(none)'}
      -----------------------
    `);
    // For MVP, just log to console.
    // In production, integrate with actual email service.
  },

  /**
   * Sends a user verification email (mocked for MVP).
   * @param to The recipient's email address.
   * @param verificationLink The link for email verification.
   */
  async sendVerificationEmail(to: string, verificationLink: string): Promise<void> {
    const subject = 'Verify Your AI CV Assistant Account';
    const text = `Please verify your account by clicking on this link: ${verificationLink}`;
    const html = `<p>Please verify your account by clicking on this link: <a href="${verificationLink}">${verificationLink}</a></p>`;

    await this.sendEmail({ to, subject, text, html });
  },

  // Other email sending functions (e.g., password reset) would go here
};
