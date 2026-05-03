import NextAuth from "next-auth";
import { Resend as ResendClient } from "resend";
import ResendProvider from "next-auth/providers/resend";
import PostgresAdapter from "@auth/pg-adapter";
import { pool } from "./db";

function buildEmailHtml(url: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Sign in to HitBet</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0f;padding:48px 16px;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;">

          <!-- Logo / brand -->
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <span style="font-size:28px;font-weight:800;letter-spacing:-0.5px;color:#ffffff;">
                Hit<span style="color:#6366f1;">Bet</span>
              </span>
              <p style="margin:6px 0 0;font-size:12px;text-transform:uppercase;letter-spacing:2px;color:#6b7280;">Arbitrage Intelligence</p>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:linear-gradient(145deg,#13131f 0%,#1a1a2e 100%);border:1px solid #2d2d4a;border-radius:16px;padding:48px 40px;">

              <!-- Headline -->
              <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#ffffff;text-align:center;">Your sign-in link</h1>
              <p style="margin:0 0 32px;font-size:15px;color:#9ca3af;text-align:center;line-height:1.6;">
                Click the button below to securely sign in to your HitBet account. The link expires in <strong style="color:#e5e7eb;">10 minutes</strong>.
              </p>

              <!-- CTA button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${url}"
                       style="display:inline-block;background:linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%);color:#ffffff;font-size:16px;font-weight:700;text-decoration:none;padding:16px 48px;border-radius:10px;letter-spacing:0.3px;box-shadow:0 4px 24px rgba(99,102,241,0.35);">
                      Sign in to HitBet &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:36px 0;">
                <tr>
                  <td style="border-top:1px solid #2d2d4a;"></td>
                </tr>
              </table>

              <!-- Feature pills -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-bottom:8px;">
                    <p style="margin:0 0 16px;font-size:12px;text-transform:uppercase;letter-spacing:1.5px;color:#6b7280;">What's waiting for you</p>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:0 4px;">
                          <span style="display:inline-block;background:#1e1e35;border:1px solid #2d2d4a;border-radius:6px;padding:7px 14px;font-size:12px;color:#a5b4fc;font-weight:600;">⚡ Live Arb Alerts</span>
                        </td>
                        <td style="padding:0 4px;">
                          <span style="display:inline-block;background:#1e1e35;border:1px solid #2d2d4a;border-radius:6px;padding:7px 14px;font-size:12px;color:#34d399;font-weight:600;">📈 Real-time Odds</span>
                        </td>
                        <td style="padding:0 4px;">
                          <span style="display:inline-block;background:#1e1e35;border:1px solid #2d2d4a;border-radius:6px;padding:7px 14px;font-size:12px;color:#fbbf24;font-weight:600;">🎯 Smart Stakes</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Fallback URL -->
              <p style="margin:32px 0 0;font-size:12px;color:#6b7280;text-align:center;line-height:1.6;">
                If the button doesn't work, paste this link into your browser:<br/>
                <a href="${url}" style="color:#6366f1;word-break:break-all;text-decoration:none;">${url}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:28px;">
              <p style="margin:0;font-size:12px;color:#4b5563;line-height:1.6;">
                If you didn't request this email you can safely ignore it.<br/>
                &copy; ${new Date().getFullYear()} HitBet &mdash; Arbitrage Intelligence Platform
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PostgresAdapter(pool),

  secret: process.env.NEXTAUTH_SECRET,

  session: {
    strategy: "jwt",
  },

  providers: [
    ResendProvider({
      apiKey: process.env.AUTH_RESEND_KEY!,
      from: process.env.EMAIL_FROM!,
      async sendVerificationRequest({ identifier: email, url }) {
        const resend = new ResendClient(process.env.AUTH_RESEND_KEY!);
        await resend.emails.send({
          from: process.env.EMAIL_FROM!,
          to: email,
          subject: "Your HitBet sign-in link",
          html: buildEmailHtml(url),
        });
      },
    }),
  ],

  pages: {
    signIn: "/login",
    verifyRequest: "/login?sent=1",
    error: "/login?error=1",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user?.email) {
        token.email = user.email;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user && token.email) {
        session.user.email = token.email as string;
      }
      return session;
    },
  },
});