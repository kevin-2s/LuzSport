import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { IUserRepository } from '../domain/user-repository.interface';
import type { ITiendaRepository } from '../../tiendas/domain/tienda-repository.interface';
import { Rol } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CreateManagerUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('ITiendaRepository')
    private readonly tiendaRepository: ITiendaRepository,
  ) {}

  async execute(email: string, passwordPlain: string, tiendaId: string) {
    const tienda = await this.tiendaRepository.findById(tiendaId);
    if (!tienda) {
      throw new NotFoundException(`La tienda con ID ${tiendaId} no existe.`);
    }

    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('El correo electrónico ya está registrado.');
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(passwordPlain, saltRounds);

    const user = await this.userRepository.create(email, passwordHash, Rol.TIENDA, tiendaId);

    return {
      id: user.id,
      email: user.email,
      rol: user.rol,
      tiendaId: user.tiendaId,
    };
  }
}
