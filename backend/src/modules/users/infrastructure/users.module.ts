import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/infrastructure/auth.module';
import { TiendasModule } from '../../tiendas/infrastructure/tiendas.module';
import { UsersController } from './users.controller';
import { CreateManagerUseCase } from '../application/create-manager.use-case';
import { PrismaUserRepository } from './prisma-user.repository';

@Module({
  imports: [AuthModule, TiendasModule],
  controllers: [UsersController],
  providers: [
    CreateManagerUseCase,
    {
      provide: 'IUserRepository',
      useClass: PrismaUserRepository,
    },
  ],
})
export class UsersModule {}
