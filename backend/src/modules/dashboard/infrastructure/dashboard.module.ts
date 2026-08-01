import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/infrastructure/auth.module';
import { DashboardController } from './dashboard.controller';
import { GetDashboardDataUseCase } from '../application/get-dashboard-data.use-case';
import { PrismaDashboardRepository } from './prisma-dashboard.repository';

@Module({
  imports: [AuthModule],
  controllers: [DashboardController],
  providers: [
    GetDashboardDataUseCase,
    {
      provide: 'IDashboardRepository',
      useClass: PrismaDashboardRepository,
    },
  ],
})
export class DashboardModule {}
