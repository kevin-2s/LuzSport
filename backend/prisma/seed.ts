import { PrismaClient, Rol } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load env variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const prisma = new PrismaClient();

async function main() {
  const superadminEmail = process.env.SUPERADMIN_EMAIL;
  const superadminPassword = process.env.SUPERADMIN_PASSWORD;

  if (!superadminEmail || !superadminPassword) {
    throw new Error(
      'Error: Las variables de entorno SUPERADMIN_EMAIL o SUPERADMIN_PASSWORD no están definidas en el archivo .env.'
    );
  }

  console.log('Clearing database...');
  await prisma.abono.deleteMany({});
  await prisma.fiado.deleteMany({});
  await prisma.cliente.deleteMany({});
  await prisma.detalleVenta.deleteMany({});
  await prisma.venta.deleteMany({});
  await prisma.tallaStock.deleteMany({});
  await prisma.articulo.deleteMany({});
  await prisma.usuario.deleteMany({});
  await prisma.tienda.deleteMany({});

  console.log('Seeding initial Superadmin account from environment variables...');
  const saltRounds = 10;
  const hashPassword = bcrypt.hashSync(superadminPassword, saltRounds);

  const superadmin = await prisma.usuario.create({
    data: {
      email: superadminEmail,
      password: hashPassword,
      rol: Rol.SUPERADMIN,
    },
  });

  console.log('Seeding complete!');
  console.log(`- Administrador inicial creado con éxito: ${superadmin.email}`);
  console.log('(La contraseña fue cifrada a partir de la variable de entorno del archivo .env)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
