import {
  ConflictException,
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { HashingService } from 'src/shared/services/hashing.service';
import { PrismaService } from 'src/shared/services/prisma.service';
import { LoginBodyDTO, RegisterBodyDTO } from './auth.dto';
import { TokenService } from 'src/shared/services/token.service';
@Injectable()
export class AuthService {
  constructor(
    private readonly hashingService: HashingService,
    private readonly prismaService: PrismaService,
    private readonly tokenService: TokenService,
  ) {}
  async register(body: RegisterBodyDTO) {
    try {
      const hashedPassword = await this.hashingService.hash(body.password);
      const user = await this.prismaService.user.create({
        data: {
          email: body.email,
          password: hashedPassword,
          name: body.name,
        },
      });
      return user;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new ConflictException('Email already exists');
      }
      throw error;
    }
  }

  async login(body: LoginBodyDTO) {
    const user = await this.prismaService.user.findUnique({
      where: {
        email: body.email,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Account is not exits');
    }

    const isPasswordMatch = await this.hashingService.compare(
      body.password,
      user.password,
    );

    if (!isPasswordMatch) {
      throw new UnprocessableEntityException([
        {
          field: 'password',
          error: 'Password is incorrect',
        },
      ]);
    }

    const tokens = await this.generateTokens({ userId: user.id });
    return tokens;
  }

  async refreshToken(refreshToken: string) {
    try {
      const { userId } =
        await this.tokenService.verifyRefreshToken(refreshToken);
      await this.prismaService.refreshToken.findUniqueOrThrow({
        where: {
          token: refreshToken,
        },
      });
      // 3. Xóa refreshToken cũ
      await this.prismaService.refreshToken.delete({
        where: {
          token: refreshToken,
        },
      });
      // 4. Tạo mới accessToken và refreshToken
      return await this.generateTokens({ userId });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new UnauthorizedException('Refresh token has revoked');
      }
      throw new UnauthorizedException();
    }
  }

  async generateTokens(payload: { userId: number }) {
    const [accessToken, refreshToken] = await Promise.all([
      this.tokenService.signAccessToken(payload),
      this.tokenService.signRefreshToken(payload),
    ]);
    const decodedRefreshToken =
      await this.tokenService.verifyRefreshToken(refreshToken);
    await this.prismaService.refreshToken.create({
      data: {
        token: refreshToken,
        userId: payload.userId,
        expiresAt: new Date(decodedRefreshToken.exp * 1000),
      },
    });
    return { accessToken, refreshToken };
  }
}
