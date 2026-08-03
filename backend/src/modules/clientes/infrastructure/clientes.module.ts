import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/infrastructure/auth.module';
import { ClientesController } from './clientes.controller';
import { PrismaClienteRepository } from './prisma-cliente.repository';

@Module({
  imports: [AuthModule],
  controllers: [ClientesController],
  providers: [
    {
      provide: 'IClienteRepository',
      useClass: PrismaClienteRepository,
    },
  ],
  exports: ['IClienteRepository'],
})
export class ClientesModule {}
