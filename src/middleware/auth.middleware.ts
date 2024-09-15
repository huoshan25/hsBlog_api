import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { authConfig } from 'src/config/auth.config';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private jwtService: JwtService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('没有提供授权头');
    }

    const [bearer, token] = authHeader.split(' ');
    if (bearer !== 'Bearer' || !token) {
      throw new UnauthorizedException('授权头格式无效');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: authConfig.jwtSecret,
      });
      req['user'] = payload;
      next();
    } catch (error) {
      throw new UnauthorizedException('无效或过期令牌');
    }
  }
}