import { Controller, Get, Post, Body, UseGuards, Patch, Param } from '@nestjs/common';
import { ListArticulosUseCase } from '../application/list-articulos.use-case';
import { CreateArticuloUseCase } from '../application/create-articulo.use-case';
import { AddStockUseCase } from '../application/add-stock.use-case';
import { JwtAuthGuard } from '../../../shared/infrastructure/guards/jwt-auth.guard';
import { TiendaGuard } from '../../../shared/infrastructure/guards/tienda.guard';
import { ActiveUser } from '../../../shared/infrastructure/decorators/active-user.decorator';

@Controller('articulos')
@UseGuards(JwtAuthGuard, TiendaGuard)
export class ArticulosController {
  constructor(
    private readonly listArticulosUseCase: ListArticulosUseCase,
    private readonly createArticuloUseCase: CreateArticuloUseCase,
    private readonly addStockUseCase: AddStockUseCase,
  ) {}

  @Get()
  async list(@ActiveUser('tiendaId') tiendaId: string) {
    return this.listArticulosUseCase.execute(tiendaId);
  }

  @Post()
  async create(
    @ActiveUser('tiendaId') tiendaId: string,
    @Body() body: {
      nombre: string;
      categoria: string;
      color: string;
      precio: number;
      tallas: { talla: string; cantidad: number; stockMinimo: number }[];
    },
  ) {
    return this.createArticuloUseCase.execute(tiendaId, body);
  }

  @Patch(':id/stock')
  async addStock(
    @ActiveUser('tiendaId') tiendaId: string,
    @Param('id') articuloId: string,
    @Body() body: { tallaId: string; cantidad: number },
  ) {
    return this.addStockUseCase.execute(tiendaId, articuloId, body.tallaId, body.cantidad);
  }
}
