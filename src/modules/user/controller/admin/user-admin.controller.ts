import {
  Controller,
  Post,
  Body,
  HttpStatus,
  Headers,
  HttpCode,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginDto } from '../../dto/login.dto';
import { RegisterDto } from '../../dto/register.dto';
import { AuthService } from '../../service/auth.service';

@Controller('admin/user')
export class UserAdminController {
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

  // @Post('register')
  // async register(@Body() registerDto: RegisterDto) {
  //   await this.authService.register(registerDto);
  //   return {
  //     message: '注册成功'
  //   };
  // }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Headers('Authorization') authHeader: string) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('无效的授权头');
    }
    const refreshToken = authHeader.split(' ')[1];
    const tokens = await this.authService.refreshToken(refreshToken);
    return {
      data: tokens,
    };
  }

}
