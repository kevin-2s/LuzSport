import { Inject, Injectable } from '@nestjs/common';
import type { IVentaRepository } from '../domain/venta-repository.interface';

@Injectable()
export class CreateVentaUseCase {
  constructor(
    @Inject('IVentaRepository')
    private readonly ventaRepository: IVentaRepository,
  ) {}

  async execute(
    tiendaId: string,
    data: {
      total: number;
      estado: 'PAGADA' | 'FIADA';
      detalles: { articuloId: string; talla: string; cantidad: number; precioUnitario: number }[];
      clienteId?: string;
    },
  ) {
    return this.ventaRepository.create(tiendaId, data);
  }
}
