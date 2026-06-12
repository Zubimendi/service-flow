import { Role } from "@prisma/client";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  tenantId: string | null;
}

declare module "next-auth" {
  interface Session {
    user: SessionUser;
  }

  interface User {
    id: string;
    email: string;
    name: string;
    role: Role;
    tenantId: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    tenantId: string | null;
    tenantSlug: string | null;
  }
}
