import { PrismaClient } from "@prisma/client";
import { prisma } from "./prisma";

type TransactionClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

export async function withTenantContext<T>(
  tenantId: string,
  fn: (tx: TransactionClient) => Promise<T>
): Promise<T> {
  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`;
    await tx.$executeRaw`SELECT set_config('app.bypass_rls', 'false', true)`;
    return fn(tx);
  });
}

export async function withBypassRls<T>(
  fn: (tx: TransactionClient) => Promise<T>
): Promise<T> {
  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT set_config('app.bypass_rls', 'true', true)`;
    return fn(tx);
  });
}

export async function getTenantBySlug(slug: string) {
  return withBypassRls((tx) =>
    tx.tenant.findUnique({
      where: { slug },
      include: {
        users: {
          where: { role: { in: ["TENANT_OWNER", "STAFF"] } },
        },
      },
    })
  );
}

export async function getTenantById(id: string) {
  return withBypassRls((tx) => tx.tenant.findUnique({ where: { id } }));
}
