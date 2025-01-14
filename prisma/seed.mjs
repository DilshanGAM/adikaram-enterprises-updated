import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.user.create({
    data: {
      email: "shashika@adikaram.com",
      name: "Shashika Adikaram",
      phone: "1234567890",
      whatsapp: "1234567890",
      address: "Maharagama, Sri Lanka",
      title: "System Administrator",
      role: "admin",
      password: "$2b$10$owGhgACyMsHLKEEKsFkyieEhlgcwkIgOLH6H/sFWdZ2bS7pRk8Bee",
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
