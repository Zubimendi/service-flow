-- CreateEnum
CREATE TYPE "Role" AS ENUM ('PLATFORM_ADMIN', 'TENANT_OWNER', 'STAFF', 'CUSTOMER');
CREATE TYPE "AppointmentStatus" AS ENUM ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW');
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED');
CREATE TYPE "SubscriptionPlan" AS ENUM ('STARTER', 'PRO', 'ENTERPRISE');
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'PAST_DUE', 'CANCELLED', 'TRIALING', 'INCOMPLETE');
CREATE TYPE "TenantStatus" AS ENUM ('ACTIVE', 'SUSPENDED');

-- CreateTable
CREATE TABLE "tenants" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "logoUrl" TEXT,
    "primaryColor" TEXT NOT NULL DEFAULT '#4F46E5',
    "businessHours" JSONB NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'America/New_York',
    "stripeConnectAccountId" TEXT,
    "stripeCustomerId" TEXT,
    "subscriptionPlan" "SubscriptionPlan" NOT NULL DEFAULT 'STARTER',
    "subscriptionStatus" "SubscriptionStatus" NOT NULL DEFAULT 'TRIALING',
    "status" "TenantStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "services" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "durationMinutes" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "assignedStaffIds" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "staff_availabilities" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "exceptions" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "staff_availabilities_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "clients" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "appointments" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "status" "AppointmentStatus" NOT NULL DEFAULT 'PENDING',
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "reminderSentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "appointmentId" TEXT NOT NULL,
    "stripePaymentIntentId" TEXT,
    "stripeSessionId" TEXT,
    "amount" INTEGER NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "stripe_events" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "processed" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stripe_events_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE UNIQUE INDEX "tenants_slug_key" ON "tenants"("slug");
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE INDEX "users_tenantId_idx" ON "users"("tenantId");
CREATE INDEX "services_tenantId_idx" ON "services"("tenantId");
CREATE INDEX "staff_availabilities_tenantId_userId_idx" ON "staff_availabilities"("tenantId", "userId");
CREATE INDEX "clients_tenantId_idx" ON "clients"("tenantId");
CREATE UNIQUE INDEX "clients_tenantId_email_key" ON "clients"("tenantId", "email");
CREATE INDEX "appointments_tenantId_staffId_startTime_idx" ON "appointments"("tenantId", "staffId", "startTime");
CREATE INDEX "appointments_startTime_reminderSentAt_idx" ON "appointments"("startTime", "reminderSentAt");
CREATE INDEX "payments_tenantId_idx" ON "payments"("tenantId");
CREATE UNIQUE INDEX "payments_stripePaymentIntentId_key" ON "payments"("stripePaymentIntentId");
CREATE UNIQUE INDEX "stripe_events_eventId_key" ON "stripe_events"("eventId");

-- Foreign keys
ALTER TABLE "users" ADD CONSTRAINT "users_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "services" ADD CONSTRAINT "services_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "staff_availabilities" ADD CONSTRAINT "staff_availabilities_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "staff_availabilities" ADD CONSTRAINT "staff_availabilities_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "clients" ADD CONSTRAINT "clients_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "payments" ADD CONSTRAINT "payments_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "payments" ADD CONSTRAINT "payments_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "appointments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
