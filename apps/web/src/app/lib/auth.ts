import NextAuth from "next-auth";
import PostgresAdapter from "@auth/pg-adapter";
import Resend from "next-auth/providers/resend";
import { pool } from "./db";

export const { handlers, auth } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  adapter: PostgresAdapter(pool),
  providers: [
    Resend({
      apiKey: process.env.AUTH_RESEND_KEY!,
      from: process.env.EMAIL_FROM!,
    }),
  ],
  pages: {
    signIn: "/login",
    verifyRequest: "/login?sent=1",
    error: "/login?error=1",
  },
});