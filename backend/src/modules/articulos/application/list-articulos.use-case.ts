import { Inject, Injectable } from '@nestjs/common';
import type { IArticuloRepository } from '../domain/articulo-repository.interface';

@Injectable()
export class ListArticulosUseCase {
  constructor(
    @Inject('IArticuloRepository')
    private readonly articuloRepository: IArticuloRepository,
  ) {}

  async execute(tiendaId: string) {
    return this.articuloRepository.listByTienda(tiendaId);
  }
}
