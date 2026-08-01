import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './shared/infrastructure/database/database.module';
import { AuthModule } from './modules/auth/infrastructure/auth.module';
import { TiendasModule } from './modules/tiendas/infrastructure/tiendas.module';
import { UsersModule } from './modules/users/infrastructure/users.module';
import { DashboardModule } from './modules/dashboard/infrastructure/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    AuthModule,
    TiendasModule,
    UsersModule,
    DashboardModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
