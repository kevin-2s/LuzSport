import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/infrastructure/auth.module';
import { ArticulosController } from './articulos.controller';
import { ListArticulosUseCase } from '../application/list-articulos.use-case';
import { CreateArticuloUseCase } from '../application/create-articulo.use-case';
import { AddStockUseCase } from '../application/add-stock.use-case';
import { PrismaArticuloRepository } from './prisma-articulo.repository';

@Module({
  imports: [AuthModule],
  controllers: [ArticulosController],
  providers: [
    ListArticulosUseCase,
    CreateArticuloUseCase,
    AddStockUseCase,
    {
      provide: 'IArticuloRepository',
      useClass: PrismaArticuloRepository,
    },
  ],
})
export class ArticulosModule {}
