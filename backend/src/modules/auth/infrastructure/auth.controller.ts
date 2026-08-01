import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { LoginUseCase } from '../application/login.use-case';
import { LoginDto } from './dtos/login.dto';
import { JwtAuthGuard } from '../../../../src/shared/infrastructure/guards/jwt-auth.guard';
import { ActiveUser } from '../../../../src/shared/infrastructure/decorators/active-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly loginUseCase: LoginUseCase) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.loginUseCase.execute(loginDto.email, loginDto.password);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@ActiveUser() user: any) {
    return user;
  }
}
