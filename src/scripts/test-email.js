const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env.local') });

async function testEmail() {
  console.log("Config:", {
    host: process.env.EMAIL_SERVER,
    port: process.env.EMAIL_PORT,
    user: process.env.EMAIL_USER,
    from: process.env.EMAIL_FROM,
    to: process.env.ADMIN_EMAIL
  });

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_PORT === '465',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
        rejectUnauthorized: false
    }
  });

  try {
    console.log("Verifying transporter...");
    await transporter.verify();
    console.log("✅ Transporter verified!");

    console.log("Sending test mail...");
    const info = await transporter.sendMail({
      from: `"PAIRO Test" <${process.env.EMAIL_FROM}>`,
      to: process.env.ADMIN_EMAIL,
      subject: "PAIRO Email Connectivity Test",
      text: "If you are reading this, your SMTP configuration is working correctly.",
      html: "<b>If you are reading this, your SMTP configuration is working correctly.</b>"
    });

    console.log("✅ Email sent successfully!");
    console.log("Message ID:", info.messageId);
    process.exit(0);
  } catch (err) {
    console.error("❌ Email test failed!");
    console.error("Error Name:", err.name);
    console.error("Error Message:", err.message);
    if (err.code) console.error("Error Code:", err.code);
    if (err.command) console.error("Error Command:", err.command);
    process.exit(1);
  }
}

testEmail();
