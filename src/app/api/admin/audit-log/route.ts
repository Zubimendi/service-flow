import { NextResponse } from "next/server";
import { adminDb } from "@/lib/admin/adminDb";
import { getAdminSession } from "@/lib/admin/requireAdmin";
import { z } from "zod";

const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(25),
  eventType: z.string().optional(),
  tenantId: z.string().optional(),
  actorEmail: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
});

export async function GET(request: Request) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const query = querySchema.parse(Object.fromEntries(searchParams));

  const where: Record<string, unknown> = {};
  if (query.eventType) where.eventType = query.eventType;
  if (query.tenantId) where.tenantId = query.tenantId;
  if (query.actorEmail) where.actorEmail = { contains: query.actorEmail, mode: "insensitive" };
  if (query.from || query.to) {
    where.createdAt = {
      ...(query.from && { gte: new Date(query.from) }),
      ...(query.to && { lte: new Date(query.to) }),
    };
  }

  const [logs, total] = await Promise.all([
    adminDb.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    }),
    adminDb.auditLog.count({ where }),
  ]);

  return NextResponse.json({
    logs,
    total,
    page: query.page,
    pages: Math.ceil(total / query.limit),
  });
}
