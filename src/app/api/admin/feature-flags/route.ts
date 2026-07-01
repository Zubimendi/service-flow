import { NextResponse } from "next/server";
import { adminDb } from "@/lib/admin/adminDb";
import { getAdminSession } from "@/lib/admin/requireAdmin";
import { z } from "zod";

export async function GET() {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  const flags = await adminDb.featureFlag.findMany({
    where: { tenantId: null },
    orderBy: { key: "asc" },
  });

  return NextResponse.json({ flags });
}

const createSchema = z.object({
  key: z.string().min(1).regex(/^[a-z_]+$/, "Key must be lowercase snake_case"),
  name: z.string().min(1),
  description: z.string().default(""),
  enabled: z.boolean().default(false),
});

export async function POST(request: Request) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid input", errors: parsed.error.flatten() }, { status: 400 });
  }

  const existing = await adminDb.featureFlag.findFirst({
    where: { key: parsed.data.key, tenantId: null },
  });
  if (existing) {
    return NextResponse.json({ message: "Flag with this key already exists" }, { status: 409 });
  }

  const flag = await adminDb.featureFlag.create({
    data: {
      key: parsed.data.key,
      name: parsed.data.name,
      description: parsed.data.description,
      enabled: parsed.data.enabled,
      updatedBy: admin.id,
    },
  });

  return NextResponse.json({ flag }, { status: 201 });
}
