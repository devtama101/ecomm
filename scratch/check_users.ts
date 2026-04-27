
import { prisma } from '../lib/prisma';

async function main() {
  try {
    const users = await prisma.user.findMany({
      where: {
        email: {
          in: ['pro.taufikur@gmail.com', 'dev.tama101@gmail.com']
        }
      }
    });
    console.log('--- ADMIN USERS CHECK ---');
    console.log(JSON.stringify(users, null, 2));
  } catch (err: any) {
    console.error("Prisma error in script:");
    console.error(JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
