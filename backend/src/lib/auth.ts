import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";

const isProd = !!(
  process.env.NODE_ENV === "production" ||
  (process.env.BETTER_AUTH_URL &&
    !process.env.BETTER_AUTH_URL.includes("localhost") &&
    !process.env.BETTER_AUTH_URL.includes("127.0.0.1"))
);

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      let resetUrl = url;
      if (process.env.FRONTEND_URL) {
        // Replace backend base URL with frontend base URL in reset link
        const backendOrigin = process.env.BETTER_AUTH_URL || "http://localhost:3001";
        resetUrl = url.replace(backendOrigin, process.env.FRONTEND_URL);
      }
      
      console.log(`[Better-Auth] Reset password URL: ${resetUrl}`);

      if (!process.env.RESEND_API_KEY) {
        console.warn("[Better-Auth] RESEND_API_KEY is not defined. Email reset not sent.");
        return;
      }

      try {
        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Phom <onboarding@resend.dev>",
            to: [user.email],
            subject: "Reset Kata Sandi Akun Phom Anda",
            html: `
              <div style="font-family: sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
                <div style="text-align: center; margin-bottom: 24px;">
                  <span style="font-size: 24px; font-weight: 800; color: #3525cd;">Phom</span>
                </div>
                <h2 style="color: #0f172a; font-size: 18px; font-weight: 700; margin-bottom: 12px;">Atur Ulang Kata Sandi</h2>
                <p style="color: #475569; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">Halo <strong>${user.name}</strong>,</p>
                <p style="color: #475569; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">Kami menerima permintaan untuk mengatur ulang kata sandi akun Phom Anda. Silakan klik tombol di bawah ini untuk melanjutkan:</p>
                <div style="text-align: center; margin: 28px 0;">
                  <a href="${resetUrl}" style="background: linear-gradient(135deg, #3525cd, #6f3dd9); color: #ffffff; padding: 12px 28px; border-radius: 9999px; text-decoration: none; font-size: 14px; font-weight: bold; display: inline-block;">Atur Ulang Kata Sandi</a>
                </div>
                <p style="color: #64748b; font-size: 13px; line-height: 1.6; margin-bottom: 16px;">Tautan di atas hanya berlaku selama <strong>1 jam</strong>. Jika Anda tidak merasa meminta pengaturan ulang kata sandi, silakan abaikan email ini.</p>
                <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
                <p style="color: #94a3b8; font-size: 11px; text-align: center;">Phom - Platform SaaS Simulator Sidang Skripsi Berbasis AI</p>
              </div>
            `,
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          console.error("[Better-Auth] Resend API error response:", errText);
        } else {
          console.log(`[Better-Auth] Reset password email sent successfully to ${user.email}`);
        }
      } catch (err) {
        console.error("[Better-Auth] Exception while sending email via Resend:", err);
      }
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  trustedOrigins: [process.env.FRONTEND_URL].filter(Boolean) as string[],
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: {
    allowedHosts: [
      "localhost:3000",
      "localhost:3001",
      "phom-thesis.vercel.app",
      "phom-backend.onrender.com",
      process.env.FRONTEND_URL,
      process.env.BETTER_AUTH_URL,
    ]
      .filter(Boolean)
      .map((url) => {
        try {
          const parsed = new URL(url!);
          return parsed.host;
        } catch {
          return url!;
        }
      })
      .filter(Boolean),
  },
  advanced: {
    trustedProxyHeaders: true,
    useSecureCookies: isProd,
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
    },
    crossSubDomainCookies: {
      enabled: true,
    },
  },
});
