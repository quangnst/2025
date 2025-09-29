import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  SerializeOptions,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  LoginBodyDTO,
  LoginResDTO,
  RefreshTokenBodyDTO,
  RefreshTokenResDTO,
  RegisterBodyDTO,
  RegisterResDTO,
} from './auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @SerializeOptions({ type: RegisterResDTO })
  @Post('register')
  async register(@Body() body: RegisterBodyDTO) {
    return await this.authService.register(body);
  }

  @SerializeOptions({ type: LoginResDTO })
  @Post('login')
  async login(@Body() body: LoginBodyDTO) {
    return await this.authService.login(body);
  }

  @SerializeOptions({ type: RefreshTokenResDTO })
  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body() body: RefreshTokenBodyDTO) {
    return await this.authService.refreshToken(body.refreshToken);
  }
}
