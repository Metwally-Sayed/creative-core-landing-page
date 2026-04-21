import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { getAdminUser } from "@/lib/admin-users";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const authSecretSchema = z.object({
  AUTH_SECRET: z.string().min(1, "AUTH_SECRET is required"),
});

const envParsed = authSecretSchema.safeParse({
  AUTH_SECRET: process.env.AUTH_SECRET,
});

if (!envParsed.success) {
  const issues = envParsed.error.issues
    .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
    .join("\n");
  throw new Error(`[auth] Missing/invalid environment variables:\n${issues}`);
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: envParsed.data.AUTH_SECRET,
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

        // Look up the admin from Supabase — no env var hashing issues
        const admin = await getAdminUser();
        if (!admin) return null;

        if (email.toLowerCase() !== admin.email.toLowerCase()) return null;

        const passwordMatches = await bcrypt.compare(password, admin.password_hash);
        if (!passwordMatches) return null;

        return { id: admin.id, email: admin.email, role: "admin" };
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
