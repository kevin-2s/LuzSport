import { Inject, Injectable } from '@nestjs/common';
import type { IVentaRepository } from '../domain/venta-repository.interface';

@Injectable()
export class ListVentasUseCase {
  constructor(
    @Inject('IVentaRepository')
    private readonly ventaRepository: IVentaRepository,
  ) {}

  async execute(tiendaId: string) {
    return this.ventaRepository.listByTienda(tiendaId);
  }
}
