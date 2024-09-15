import {
  Controller,
  Post,
  Body,
  HttpStatus,
  Headers,
  HttpCode,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthService } from './auth.service';

@Controller('user')
export class UserController {
  constructor(
    private authService: AuthService
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    const data = await this.authService.login(loginDto);
    return {
      data,
      message: '登录成功'
    };
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    await this.authService.register(registerDto);
    return {
      message: '注册成功'
    };
  }

  @Post('refresh-token')
  async refreshToken(@Headers('Authorization') authHeader: string) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('无效授权头');
    }
    const refreshToken = authHeader.split(' ')[1];
    return this.authService.refreshToken(refreshToken);
  }

}
