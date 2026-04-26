import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

// Email configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function POST(req) {
  try {
    const body = await req.json();
    const { to, subject, html, podId, podNo } = body;

    if (!to) {
      return NextResponse.json(
        { success: false, message: "Recipient email is required" },
        { status: 400 }
      );
    }

    if (!subject) {
      return NextResponse.json(
        { success: false, message: "Email subject is required" },
        { status: 400 }
      );
    }

    if (!html) {
      return NextResponse.json(
        { success: false, message: "Email content is required" },
        { status: 400 }
      );
    }

    // Email options
    const mailOptions = {
      from: `"ERP System" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      html: html,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    console.log(`✅ Email sent to ${to}: ${info.messageId}`);

    return NextResponse.json({
      success: true,
      message: `Email sent successfully to ${to}`,
      data: {
        messageId: info.messageId,
        to: to,
        subject: subject,
        podId: podId,
        podNo: podNo,
        sentAt: new Date().toISOString(),
      },
    }, { status: 200 });

  } catch (error) {
    console.error("❌ Error sending email:", error);
    return NextResponse.json({
      success: false,
      message: error.message || "Failed to send email",
    }, { status: 500 });
  }
}

// Optional: Test email endpoint
export async function GET(req) {
  try {
    const url = new URL(req.url);
    const testEmail = url.searchParams.get("email");

    if (!testEmail) {
      return NextResponse.json({
        success: false,
        message: "Email parameter is required. Use ?email=test@example.com"
      }, { status: 400 });
    }

    const testMailOptions = {
      from: `"ERP System" <${process.env.EMAIL_USER}>`,
      to: testEmail,
      subject: "Test Email from ERP System",
      html: `
        <h2>Test Email</h2>
        <p>This is a test email from your ERP System.</p>
        <p>If you received this, your email configuration is working correctly!</p>
        <hr />
        <p>Sent at: ${new Date().toLocaleString()}</p>
      `,
    };

    const info = await transporter.sendMail(testMailOptions);

    return NextResponse.json({
      success: true,
      message: `Test email sent to ${testEmail}`,
      messageId: info.messageId,
    }, { status: 200 });

  } catch (error) {
    console.error("❌ Error sending test email:", error);
    return NextResponse.json({
      success: false,
      message: error.message,
    }, { status: 500 });
  }
}