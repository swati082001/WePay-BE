import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import * as jwt from 'jsonwebtoken';
import { UsersService } from '../users/users.service';
import type { AuthUserPayload } from './dto/auth-response.dto';
import type { RegisterDto } from './dto/register.dto';
import type { LoginDto } from './dto/login.dto';

export type TokenPair = {
  accessToken: string;
  refreshToken: string;
};

export type AuthResult = TokenPair & { user: AuthUserPayload };

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResult> {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('User with this email already exists');
    }
    const passwordHash = await argon2.hash(dto.password);
    const user = await this.usersService.create({
      name: dto.name,
      email: dto.email,
      passwordHash,
      avatarUrl: dto.avatarUrl ?? null,
    });
    const userPayload = this.usersService.toResponse(user);
    const tokens = await this.issueTokens(userPayload);
    return { ...tokens, user: userPayload };
  }

  async login(dto: LoginDto): Promise<AuthResult> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const valid = await argon2.verify(user.passwordHash, dto.password);
    if (!valid) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const userPayload = this.usersService.toResponse(user);
    const tokens = await this.issueTokens(userPayload);
    return { ...tokens, user: userPayload };
  }

  async refresh(refreshToken: string): Promise<TokenPair> {
    const secret = this.config.getOrThrow<string>('JWT_REFRESH_SECRET');
    let payload: { sub: string; email: string };
    try {
      payload = jwt.verify(refreshToken, secret) as { sub: string; email: string };
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }
    const userPayload = this.usersService.toResponse(user);
    return this.issueTokens(userPayload);
  }

  async logout(): Promise<void> {
    // Stateless JWT: client discards tokens. Optional blacklist can be added later.
  }

  private async issueTokens(user: AuthUserPayload): Promise<TokenPair> {
    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.config.get('JWT_ACCESS_EXPIRY', '15m'),
    });
    const refreshSecret = this.config.getOrThrow<string>('JWT_REFRESH_SECRET');
    const refreshExpiry = this.config.get('JWT_REFRESH_EXPIRY', '7d');
    const refreshToken = jwt.sign(payload, refreshSecret, { expiresIn: refreshExpiry });
    return { accessToken, refreshToken };
  }
}
