-- Row-Level Security policies for tenant isolation
-- Requires btree_gist for exclusion constraint on appointments

CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Enable RLS on all tenant-scoped tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_availabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Helper: current tenant from session variable
-- Usage: SELECT set_config('app.current_tenant_id', '<uuid>', true);

-- Tenants: can only read own tenant row
CREATE POLICY tenant_isolation_select ON tenants
  FOR SELECT
  USING (
    current_setting('app.bypass_rls', true) = 'true'
    OR id = current_setting('app.current_tenant_id', true)
  );

CREATE POLICY tenant_isolation_update ON tenants
  FOR UPDATE
  USING (
    current_setting('app.bypass_rls', true) = 'true'
    OR id = current_setting('app.current_tenant_id', true)
  );

-- Users
CREATE POLICY users_tenant_isolation ON users
  FOR ALL
  USING (
    current_setting('app.bypass_rls', true) = 'true'
    OR "tenantId" = current_setting('app.current_tenant_id', true)
    OR "tenantId" IS NULL
  )
  WITH CHECK (
    current_setting('app.bypass_rls', true) = 'true'
    OR "tenantId" = current_setting('app.current_tenant_id', true)
    OR "tenantId" IS NULL
  );

-- Services
CREATE POLICY services_tenant_isolation ON services
  FOR ALL
  USING (
    current_setting('app.bypass_rls', true) = 'true'
    OR "tenantId" = current_setting('app.current_tenant_id', true)
  )
  WITH CHECK (
    current_setting('app.bypass_rls', true) = 'true'
    OR "tenantId" = current_setting('app.current_tenant_id', true)
  );

-- Staff availabilities
CREATE POLICY staff_avail_tenant_isolation ON staff_availabilities
  FOR ALL
  USING (
    current_setting('app.bypass_rls', true) = 'true'
    OR "tenantId" = current_setting('app.current_tenant_id', true)
  )
  WITH CHECK (
    current_setting('app.bypass_rls', true) = 'true'
    OR "tenantId" = current_setting('app.current_tenant_id', true)
  );

-- Clients
CREATE POLICY clients_tenant_isolation ON clients
  FOR ALL
  USING (
    current_setting('app.bypass_rls', true) = 'true'
    OR "tenantId" = current_setting('app.current_tenant_id', true)
  )
  WITH CHECK (
    current_setting('app.bypass_rls', true) = 'true'
    OR "tenantId" = current_setting('app.current_tenant_id', true)
  );

-- Appointments
CREATE POLICY appointments_tenant_isolation ON appointments
  FOR ALL
  USING (
    current_setting('app.bypass_rls', true) = 'true'
    OR "tenantId" = current_setting('app.current_tenant_id', true)
  )
  WITH CHECK (
    current_setting('app.bypass_rls', true) = 'true'
    OR "tenantId" = current_setting('app.current_tenant_id', true)
  );

-- Payments
CREATE POLICY payments_tenant_isolation ON payments
  FOR ALL
  USING (
    current_setting('app.bypass_rls', true) = 'true'
    OR "tenantId" = current_setting('app.current_tenant_id', true)
  )
  WITH CHECK (
    current_setting('app.bypass_rls', true) = 'true'
    OR "tenantId" = current_setting('app.current_tenant_id', true)
  );

-- Prevent double-booking: no overlapping appointments for same staff
-- tstzrange() is STABLE (timezone-dependent), so GiST/EXCLUDE indexes require an
-- IMMUTABLE wrapper — plain tstzrange() fails with SQLSTATE 42P17 on Neon/Postgres.
CREATE OR REPLACE FUNCTION appointment_time_range(start_ts timestamptz, end_ts timestamptz)
RETURNS tstzrange
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
AS $$
  SELECT tstzrange(start_ts, end_ts, '[)');
$$;

ALTER TABLE appointments
  ADD CONSTRAINT appointments_no_overlap
  EXCLUDE USING gist (
    "tenantId" WITH =,
    "staffId" WITH =,
    appointment_time_range("startTime", "endTime") WITH &&
  )
  WHERE (status NOT IN ('CANCELLED', 'NO_SHOW'));
