import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin/requireAdmin";
import { adminDb } from "@/lib/admin/adminDb";
import { writeAuditLog } from "@/lib/admin/auditLog";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { AuditEventType } from "@prisma/client";

const createAdminSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function POST(request: Request) {
  const currentAdmin = await getAdminSession();
  if (!currentAdmin) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = createAdminSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Invalid input", errors: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const existingUser = await adminDb.user.findUnique({
    where: { email: parsed.data.email },
  });

  if (existingUser) {
    return NextResponse.json(
      { message: "A user with this email already exists" },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  const newAdmin = await adminDb.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
      role: "PLATFORM_ADMIN",
    },
  });

  await writeAuditLog({
    actorId: currentAdmin.id,
    actorEmail: currentAdmin.email,
    eventType: AuditEventType.ADMIN_CREATED,
    description: `Platform admin "${newAdmin.name}" (${newAdmin.email}) created by admin ${currentAdmin.email}`,
    metadata: { createdAdminId: newAdmin.id, createdAdminEmail: newAdmin.email },
  });

  return NextResponse.json(
    {
      message: "Admin created successfully",
      admin: {
        id: newAdmin.id,
        name: newAdmin.name,
        email: newAdmin.email,
        role: newAdmin.role,
        createdAt: newAdmin.createdAt,
      },
    },
    { status: 201 }
  );
}
