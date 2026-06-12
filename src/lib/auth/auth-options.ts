import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { withBypassRls } from "@/lib/db/tenant-client";
import { loginSchema } from "@/lib/validations/auth";
import "@/types/auth";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await withBypassRls(async (tx) => {
          const found = await tx.user.findUnique({ where: { email: parsed.data.email } });
          if (!found) return null;
          let tenantSlug: string | null = null;
          if (found.tenantId) {
            const tenant = await tx.tenant.findUnique({
              where: { id: found.tenantId },
              select: { slug: true },
            });
            tenantSlug = tenant?.slug ?? null;
          }
          return { ...found, tenantSlug };
        });

        if (!user) return null;

        const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          tenantId: user.tenantId,
          tenantSlug: user.tenantSlug,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.tenantId = user.tenantId;
        token.tenantSlug = (user as { tenantSlug?: string | null }).tenantSlug ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.tenantId = token.tenantId;
      }
      return session;
    },
  },
};
