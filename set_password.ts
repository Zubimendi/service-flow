import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@serviceflow.app';
  const password = 'SuperAdminPassword123!';
  const passwordHash = await bcrypt.hash(password, 10);
  
  await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash,
      role: 'PLATFORM_ADMIN',
    },
    create: {
      email,
      name: 'Platform Admin',
      passwordHash,
      role: 'PLATFORM_ADMIN',
    }
  });

  console.log(`Password set for ${email}`);
}

main()
  .then(() => process.exit(0))
  .catch(e => { console.error(e); process.exit(1); });
