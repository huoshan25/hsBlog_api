import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from './user.service';
import { authConfig } from '../../config/auth.config';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  /*登录*/
  async login(loginDto: LoginDto) {
    const user = await this.userService.validateUser(loginDto);
    if (!user) {
      throw new UnauthorizedException('无效的证书');
    }
    return this.generateTokens(user);
  }

  /*注册账号*/
  async register(registerDto: RegisterDto) {
    return await this.userService.createUser(registerDto);
  }

  /*刷新token*/
  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: authConfig.refreshSecret,
      });
      const user = await this.userService.findById(payload.sub);

      return this.generateTokens(user);
    } catch (error) {
      throw new UnauthorizedException('无效的刷新令牌');
    }
  }

  /*生成令牌*/
  private generateTokens(user: any) {
    const payload = { username: user.username, sub: user.id };
    return {
      token: this.jwtService.sign(payload, {
        secret: authConfig.jwtSecret,
        expiresIn: authConfig.jwtExpiresIn,
      }),
      refresh_token: this.jwtService.sign(payload, {
        secret: authConfig.refreshSecret,
        expiresIn: authConfig.refreshExpiresIn,
      }),
    };
  }
}