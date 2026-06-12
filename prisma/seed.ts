import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { addMinutes, setHours, setMinutes } from "date-fns";

const prisma = new PrismaClient();

const defaultHours = {
  monday: { open: "09:00", close: "18:00" },
  tuesday: { open: "09:00", close: "18:00" },
  wednesday: { open: "09:00", close: "18:00" },
  thursday: { open: "09:00", close: "18:00" },
  friday: { open: "09:00", close: "18:00" },
  saturday: { open: "10:00", close: "16:00" },
  sunday: { open: "00:00", close: "00:00", closed: true },
};

async function main() {
  const passwordHash = await bcrypt.hash("password123", 12);

  await prisma.stripeEvent.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.client.deleteMany();
  await prisma.staffAvailability.deleteMany();
  await prisma.service.deleteMany();
  await prisma.user.deleteMany();
  await prisma.tenant.deleteMany();

  const platformAdmin = await prisma.user.create({
    data: {
      email: "admin@serviceflow.app",
      passwordHash,
      name: "Platform Admin",
      role: "PLATFORM_ADMIN",
    },
  });

  const glowSalon = await prisma.tenant.create({
    data: {
      slug: "glow-salon",
      name: "Glow Hair Salon",
      description: "Premium cuts, color, and styling in downtown.",
      primaryColor: "#E11D48",
      businessHours: defaultHours,
      timezone: "America/New_York",
      subscriptionPlan: "PRO",
      subscriptionStatus: "ACTIVE",
      status: "ACTIVE",
    },
  });

  const fitStudio = await prisma.tenant.create({
    data: {
      slug: "fit-studio",
      name: "Fit Studio Personal Training",
      description: "1-on-1 coaching and small group sessions.",
      primaryColor: "#059669",
      businessHours: {
        ...defaultHours,
        sunday: { open: "08:00", close: "12:00" },
      },
      timezone: "America/Los_Angeles",
      subscriptionPlan: "STARTER",
      subscriptionStatus: "ACTIVE",
      status: "ACTIVE",
    },
  });

  const glowOwner = await prisma.user.create({
    data: {
      email: "owner@glow-salon.com",
      passwordHash,
      name: "Sarah Chen",
      role: "TENANT_OWNER",
      tenantId: glowSalon.id,
    },
  });

  const glowStaff1 = await prisma.user.create({
    data: {
      email: "mia@glow-salon.com",
      passwordHash,
      name: "Mia Rodriguez",
      role: "STAFF",
      tenantId: glowSalon.id,
    },
  });

  const glowStaff2 = await prisma.user.create({
    data: {
      email: "alex@glow-salon.com",
      passwordHash,
      name: "Alex Kim",
      role: "STAFF",
      tenantId: glowSalon.id,
    },
  });

  const fitOwner = await prisma.user.create({
    data: {
      email: "owner@fit-studio.com",
      passwordHash,
      name: "Jordan Lee",
      role: "TENANT_OWNER",
      tenantId: fitStudio.id,
    },
  });

  const fitStaff1 = await prisma.user.create({
    data: {
      email: "coach@fit-studio.com",
      passwordHash,
      name: "Taylor Brooks",
      role: "STAFF",
      tenantId: fitStudio.id,
    },
  });

  const fitStaff2 = await prisma.user.create({
    data: {
      email: "trainer@fit-studio.com",
      passwordHash,
      name: "Casey Morgan",
      role: "STAFF",
      tenantId: fitStudio.id,
    },
  });

  const glowServices = await Promise.all([
    prisma.service.create({
      data: {
        tenantId: glowSalon.id,
        name: "Haircut & Style",
        description: "Consultation, wash, cut, and blow-dry.",
        durationMinutes: 60,
        price: 7500,
        assignedStaffIds: [glowStaff1.id, glowStaff2.id],
      },
    }),
    prisma.service.create({
      data: {
        tenantId: glowSalon.id,
        name: "Color Treatment",
        description: "Full color or highlights with toner.",
        durationMinutes: 120,
        price: 15000,
        assignedStaffIds: [glowStaff1.id],
      },
    }),
    prisma.service.create({
      data: {
        tenantId: glowSalon.id,
        name: "Blowout",
        description: "Wash and professional blow-dry styling.",
        durationMinutes: 45,
        price: 4500,
        assignedStaffIds: [glowStaff2.id],
      },
    }),
  ]);

  const fitServices = await Promise.all([
    prisma.service.create({
      data: {
        tenantId: fitStudio.id,
        name: "Personal Training",
        description: "60-minute 1-on-1 session.",
        durationMinutes: 60,
        price: 9000,
        assignedStaffIds: [fitStaff1.id, fitStaff2.id],
      },
    }),
    prisma.service.create({
      data: {
        tenantId: fitStudio.id,
        name: "Fitness Assessment",
        description: "Initial assessment and goal setting.",
        durationMinutes: 45,
        price: 5000,
        assignedStaffIds: [fitStaff1.id],
      },
    }),
    prisma.service.create({
      data: {
        tenantId: fitStudio.id,
        name: "Small Group Class",
        description: "Up to 4 people, strength & conditioning.",
        durationMinutes: 60,
        price: 3500,
        assignedStaffIds: [fitStaff2.id],
      },
    }),
  ]);

  const staffUsers = [glowStaff1, glowStaff2, fitStaff1, fitStaff2];
  for (const staff of staffUsers) {
    for (let day = 1; day <= 5; day++) {
      await prisma.staffAvailability.create({
        data: {
          tenantId: staff.tenantId!,
          userId: staff.id,
          dayOfWeek: day,
          startTime: "09:00",
          endTime: "17:00",
        },
      });
    }
    await prisma.staffAvailability.create({
      data: {
        tenantId: staff.tenantId!,
        userId: staff.id,
        dayOfWeek: 6,
        startTime: "10:00",
        endTime: "15:00",
      },
    });
  }

  const glowClient = await prisma.client.create({
    data: {
      tenantId: glowSalon.id,
      name: "Emma Wilson",
      email: "emma@example.com",
      phone: "+1 555-0101",
    },
  });

  const fitClient = await prisma.client.create({
    data: {
      tenantId: fitStudio.id,
      name: "Chris Patel",
      email: "chris@example.com",
      phone: "+1 555-0202",
    },
  });

  const today = new Date();
  const aptStart = setMinutes(setHours(today, 10), 0);

  await prisma.appointment.create({
    data: {
      tenantId: glowSalon.id,
      serviceId: glowServices[0].id,
      staffId: glowStaff1.id,
      clientId: glowClient.id,
      startTime: aptStart,
      endTime: addMinutes(aptStart, 60),
      status: "CONFIRMED",
      paymentStatus: "PAID",
    },
  });

  const apt2Start = setMinutes(setHours(today, 14), 0);
  await prisma.appointment.create({
    data: {
      tenantId: fitStudio.id,
      serviceId: fitServices[0].id,
      staffId: fitStaff1.id,
      clientId: fitClient.id,
      startTime: apt2Start,
      endTime: addMinutes(apt2Start, 60),
      status: "PENDING",
      paymentStatus: "PENDING",
    },
  });

  console.log("Seed complete!");
  console.log("Platform admin:", platformAdmin.email, "/ password123");
  console.log("Glow Salon owner:", glowOwner.email, "/ password123");
  console.log("Fit Studio owner:", fitOwner.email, "/ password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
