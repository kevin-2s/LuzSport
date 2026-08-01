import { Inject, Injectable } from '@nestjs/common';
import type { ITiendaRepository } from '../domain/tienda-repository.interface';

@Injectable()
export class ListTiendasUseCase {
  constructor(
    @Inject('ITiendaRepository')
    private readonly tiendaRepository: ITiendaRepository,
  ) {}

  async execute() {
    return this.tiendaRepository.findAll();
  }
}
