import { Inject, Injectable } from '@nestjs/common';
import type { ITiendaRepository } from '../domain/tienda-repository.interface';

@Injectable()
export class CreateTiendaUseCase {
  constructor(
    @Inject('ITiendaRepository')
    private readonly tiendaRepository: ITiendaRepository,
  ) {}

  async execute(nombre: string, direccion: string) {
    return this.tiendaRepository.create(nombre, direccion);
  }
}
