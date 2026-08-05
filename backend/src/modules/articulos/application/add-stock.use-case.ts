import { Injectable, Inject } from '@nestjs/common';
import type { IArticuloRepository } from '../domain/articulo-repository.interface';

@Injectable()
export class AddStockUseCase {
  constructor(
    @Inject('IArticuloRepository')
    private readonly articuloRepository: IArticuloRepository,
  ) {}

  async execute(tiendaId: string, articuloId: string, tallaId: string, cantidad: number) {
    if (cantidad <= 0) {
      throw new Error('La cantidad a añadir debe ser mayor a 0');
    }
    
    return this.articuloRepository.addStock(tiendaId, articuloId, tallaId, cantidad);
  }
}
