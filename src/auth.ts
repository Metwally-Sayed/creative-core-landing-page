import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";

const envSchema = z.object({
  AUTH_SECRET: z.string().min(1, "AUTH_SECRET is required"),
  ADMIN_EMAIL: z.string().email("ADMIN_EMAIL must be a valid email"),
  ADMIN_PASSWORD_HASH: z
    .string()
    .min(1, "ADMIN_PASSWORD_HASH is required (see scripts/hash-password.ts)"),
});

const envParsed = envSchema.safeParse({
  AUTH_SECRET: process.env.AUTH_SECRET,
  ADMIN_EMAIL: process.env.ADMIN_EMAIL,
  ADMIN_PASSWORD_HASH: process.env.ADMIN_PASSWORD_HASH,
});

if (!envParsed.success) {
  const issues = envParsed.error.issues
    .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
    .join("\n");
  throw new Error(`[auth] Missing/invalid environment variables:\n${issues}`);
}

const env = envParsed.data;

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: env.AUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
  pages: {
    signIn: "/admin/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(rawCredentials) {
        const parsed = credentialsSchema.safeParse(rawCredentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const emailMatches = constantTimeEqual(
          email.toLowerCase(),
          env.ADMIN_EMAIL.toLowerCase(),
        );
        if (!emailMatches) return null;

        const passwordMatches = await bcrypt.compare(
          password,
          env.ADMIN_PASSWORD_HASH,
        );
        if (!passwordMatches) return null;

        return { id: "admin", email: env.ADMIN_EMAIL, role: "admin" };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = "admin";
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.email = token.email as string;
        (session.user as { role?: string }).role = "admin";
      }
      return session;
    },
  },
});
