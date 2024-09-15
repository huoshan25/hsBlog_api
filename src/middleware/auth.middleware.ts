import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { authConfig } from '../config/auth.config';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  private readonly whiteList: string[] = ['/user/login', '/user/register', '/user/refresh-token'];

  constructor(private jwtService: JwtService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    if (this.whiteList.includes(req.path)) {
      return next();
    }

    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('No authorization header provided');
    }

    const [bearer, token] = authHeader.split(' ');
    if (bearer !== 'Bearer' || !token) {
      throw new UnauthorizedException('Invalid authorization header format');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: authConfig.jwtSecret,
      });
      req['user'] = payload;
      next();
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}