import { PrismaClient, Rol } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
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

  console.log('Seeding stores...');
  const tiendaNorte = await prisma.tienda.create({
    data: {
      nombre: 'LuzSport Sucursal Norte',
      direccion: 'Av. Juan B. Justo 1234, CABA',
    },
  });

  const tiendaSur = await prisma.tienda.create({
    data: {
      nombre: 'LuzSport Sucursal Sur',
      direccion: 'Calle Falsa 432, Lomas de Zamora',
    },
  });

  console.log('Seeding users...');
  const saltRounds = 10;
  const hashPassword = (pass: string) => bcrypt.hashSync(pass, saltRounds);

  // Superadmin
  await prisma.usuario.create({
    data: {
      email: 'superadmin@luzsport.com',
      password: hashPassword('superadmin123'),
      rol: Rol.SUPERADMIN,
    },
  });

  // Shop Norte Manager
  await prisma.usuario.create({
    data: {
      email: 'norte@luzsport.com',
      password: hashPassword('norte123'),
      rol: Rol.TIENDA,
      tiendaId: tiendaNorte.id,
    },
  });

  // Shop Sur Manager
  await prisma.usuario.create({
    data: {
      email: 'sur@luzsport.com',
      password: hashPassword('sur123'),
      rol: Rol.TIENDA,
      tiendaId: tiendaSur.id,
    },
  });

  console.log('Seeding complete! Initial accounts:');
  console.log('- Superadmin: superadmin@luzsport.com / superadmin123');
  console.log(`- Norte Shop Manager: norte@luzsport.com / norte123 (Tienda: ${tiendaNorte.nombre})`);
  console.log(`- Sur Shop Manager: sur@luzsport.com / sur123 (Tienda: ${tiendaSur.nombre})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
