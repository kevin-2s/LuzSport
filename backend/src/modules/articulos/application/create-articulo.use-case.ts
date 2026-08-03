import { Inject, Injectable } from '@nestjs/common';
import type { IArticuloRepository } from '../domain/articulo-repository.interface';

@Injectable()
export class CreateArticuloUseCase {
  constructor(
    @Inject('IArticuloRepository')
    private readonly articuloRepository: IArticuloRepository,
  ) {}

  async execute(tiendaId: string, data: {
    nombre: string;
    categoria: string;
    color: string;
    precio: number;
    tallas: { talla: string; cantidad: number; stockMinimo: number }[];
  }) {
    return this.articuloRepository.create(tiendaId, data);
  }
}
