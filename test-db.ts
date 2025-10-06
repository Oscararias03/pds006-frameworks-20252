const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  try {
    const computers = await prisma.computer.findMany();
    console.log("✅ Conexión exitosa. Computers en DB:", computers);
  } catch (err) {
    console.error("❌ Error al conectar con PostgreSQL:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
  