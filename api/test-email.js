import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        error: "Missing email",
      });
    }

    const result = await resend.emails.send({
      from: "Russian Literature Club <onboarding@resend.dev>",
      to: email,
      subject: "Test email from Russian Literature Club",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Test email</h2>
          <p>This is a test email from your literature club project.</p>
          <p>If you received this email, Resend is working correctly.</p>
        </div>
      `,
    });

    return res.status(200).json({
      success: true,
      result,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Failed to send email",
      details: error?.message || String(error),
    });
  }
}
