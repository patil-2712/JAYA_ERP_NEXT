// /app/api/send-approval-email/route.js
import { NextResponse } from "next/server";
import nodemailer from 'nodemailer';

export async function POST(req) {
  try {
    const { to, subject, message, pricingPanelId, pricingSerialNo, approvalType } = await req.json();

    if (!to || !subject || !message) {
      return NextResponse.json({
        success: false,
        message: "Missing required fields"
      }, { status: 400 });
    }

    // Create email transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // ✅ FIXED: Use correct route path
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const approvalLink = `${baseUrl}/admin/pricing-panel/approve/${pricingPanelId}?action=approve`;
    
    // Full email HTML content
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Pricing Panel Approval Request</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: white;
            padding: 30px;
            border-radius: 0 0 10px 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
            font-weight: bold;
          }
          .button:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 12px;
            color: #666;
          }
          .info-box {
            background: #f0f9ff;
            border-left: 4px solid #3b82f6;
            padding: 15px;
            margin: 20px 0;
            border-radius: 5px;
          }
          .warning {
            background: #fff3e0;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin: 20px 0;
            border-radius: 5px;
            font-size: 13px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Pricing Panel Approval Request</h2>
          </div>
          <div class="content">
            <p>Dear Approver,</p>
            <p>You have received a request to approve the following pricing panel:</p>
            
            <div class="info-box">
              <p><strong>Pricing Serial No:</strong> ${pricingSerialNo}</p>
              <p><strong>Approval Type:</strong> ${approvalType}</p>
              <p><strong>Request ID:</strong> ${pricingPanelId}</p>
              <p><strong>Request Date:</strong> ${new Date().toLocaleString()}</p>
            </div>
            
            <div style="margin: 30px 0;">
              <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; white-space: pre-wrap;">
                ${message.replace(/\n/g, '<br>')}
              </div>
            </div>
            
            <div style="text-align: center;">
              <a href="${approvalLink}" class="button" style="color: white; text-decoration: none;">✓ Approve Pricing Panel</a>
            </div>
            
            <div class="warning">
              <strong>⚠️ Important:</strong> Clicking the button above will automatically approve this pricing panel and update its status to "Approved". This action cannot be undone.
            </div>
            
            <hr style="margin: 30px 0;">
            
            <p style="font-size: 12px; color: #999;">
              This is an automated email from the ERP System. Please do not reply to this email.<br>
              If you did not expect this email, please contact your system administrator immediately.<br>
              For any questions, please contact support.
            </p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} ERP System. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email
    const mailOptions = {
      from: `"ERP System" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      text: `${message}\n\nApprove Link: ${approvalLink}\n\nNote: Clicking this link will automatically approve the pricing panel.`,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({
      success: true,
      message: "Approval email sent successfully",
      approvalLink: approvalLink // Return the link for debugging
    }, { status: 200 });

  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json({
      success: false,
      message: error.message || "Failed to send email"
    }, { status: 500 });
  }
}