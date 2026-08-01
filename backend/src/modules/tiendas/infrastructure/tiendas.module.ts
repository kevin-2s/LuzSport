import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/infrastructure/auth.module';
import { TiendasController } from './tiendas.controller';
import { CreateTiendaUseCase } from '../application/create-tienda.use-case';
import { ListTiendasUseCase } from '../application/list-tiendas.use-case';
import { PrismaTiendaRepository } from './prisma-tienda.repository';

@Module({
  imports: [AuthModule],
  controllers: [TiendasController],
  providers: [
    CreateTiendaUseCase,
    ListTiendasUseCase,
    {
      provide: 'ITiendaRepository',
      useClass: PrismaTiendaRepository,
    },
  ],
  exports: ['ITiendaRepository'],
})
export class TiendasModule {}
