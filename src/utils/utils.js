export function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export function getOTPHtml(otp) {
  return `
  <div style="font-family: Arial; background:#f4f6f8; padding:20px;">
    <div style="max-width:420px;margin:auto;background:white;padding:30px;border-radius:12px;text-align:center; box-shadow:0 10px 30px rgba(0,0,0,0.1);">

      <h2 style="color:#4f46e5;">🔐 Verify Your Email</h2>
      <p style="color:#6b7280;">Use the OTP below to continue</p>

      <div style="
        font-size:28px;
        letter-spacing:8px;
        font-weight:bold;
        margin:20px 0;
        color:#111827;
      ">
        ${otp}
      </div>

      <p style="color:#6b7280;">This code expires in 10 minutes</p>

      <p style="font-size:12px;color:#9ca3af;">
        If you didn’t request this, ignore this email.
      </p>

    </div>
  </div>
  `;
}