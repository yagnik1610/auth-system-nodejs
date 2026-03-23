import nodemailer from "nodemailer";
import { google } from "googleapis";
import config from "../config/config.js";

const OAuth2 = google.auth.OAuth2;

const oauth2Client = new OAuth2(
  config.GOOGLE_CLIENT_ID,
  config.GOOGLE_CLIENT_SECRET,
  "https://developers.google.com/oauthplayground"
);

// Set refresh token
oauth2Client.setCredentials({
  refresh_token: config.GOOGLE_REFRESH_TOKEN,
});

export const sendEmail = async (to, subject, text, html) => {
  try {
    // 🔥 Generate access token
    const accessToken = await oauth2Client.getAccessToken();

    console.log("🔑 Access Token:", accessToken?.token);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: config.GOOGLE_USER,
        clientId: config.GOOGLE_CLIENT_ID,
        clientSecret: config.GOOGLE_CLIENT_SECRET,
        refreshToken: config.GOOGLE_REFRESH_TOKEN,
        accessToken: accessToken.token, // ✅ REQUIRED
      },
    });

    const info = await transporter.sendMail({
      from: `"Auth App" <${config.GOOGLE_USER}>`,
      to,
      subject,
      text,
      html,
    });

    console.log("✅ Email sent:", info.messageId);

  } catch (error) {
    console.error("❌ Email error:", error.message);
  }
};