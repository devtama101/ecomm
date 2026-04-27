import { prisma } from "../lib/prisma";

async function main() {
  console.log("DATABASE_URL:", process.env.DATABASE_URL);
  const users = await prisma.user.findMany();
  console.log("Users in DB:");
  users.forEach(u => {
    console.log(`- ${u.email} (${u.clerkId}): role=${u.role}`);
  });
}

main();
