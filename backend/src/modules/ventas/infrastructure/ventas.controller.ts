import { Controller, Get, Post, Body, UseGuards, BadRequestException } from '@nestjs/common';
import { ListVentasUseCase } from '../application/list-ventas.use-case';
import { CreateVentaUseCase } from '../application/create-venta.use-case';
import { JwtAuthGuard } from '../../../shared/infrastructure/guards/jwt-auth.guard';
import { TiendaGuard } from '../../../shared/infrastructure/guards/tienda.guard';
import { ActiveUser } from '../../../shared/infrastructure/decorators/active-user.decorator';

@Controller('ventas')
@UseGuards(JwtAuthGuard, TiendaGuard)
export class VentasController {
  constructor(
    private readonly listVentasUseCase: ListVentasUseCase,
    private readonly createVentaUseCase: CreateVentaUseCase,
  ) {}

  @Get()
  async list(@ActiveUser('tiendaId') tiendaId: string) {
    return this.listVentasUseCase.execute(tiendaId);
  }

  @Post()
  async create(
    @ActiveUser('tiendaId') tiendaId: string,
    @Body() body: {
      total: number;
      estado: 'PAGADA' | 'FIADA';
      detalles: { articuloId: string; talla: string; cantidad: number; precioUnitario: number }[];
      clienteId?: string;
      tipoCobro?: string;
      diaCobro?: string;
    },
  ) {
    try {
      return await this.createVentaUseCase.execute(tiendaId, body);
    } catch (err: any) {
      throw new BadRequestException(err.message);
    }
  }
}
