import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/infrastructure/auth.module';
import { VentasController } from './ventas.controller';
import { ListVentasUseCase } from '../application/list-ventas.use-case';
import { CreateVentaUseCase } from '../application/create-venta.use-case';
import { PrismaVentaRepository } from './prisma-venta.repository';

@Module({
  imports: [AuthModule],
  controllers: [VentasController],
  providers: [
    ListVentasUseCase,
    CreateVentaUseCase,
    {
      provide: 'IVentaRepository',
      useClass: PrismaVentaRepository,
    },
  ],
})
export class VentasModule {}
