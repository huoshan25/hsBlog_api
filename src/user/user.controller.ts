import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Inject,
  Res,
  HttpStatus,
  UseGuards,
  ValidationPipe,
  Header,
  HttpCode,
} from '@nestjs/common';
import { UserService } from './user.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtService } from '@nestjs/jwt';
import { LoginGuard } from '../login.guard';
import { Response } from 'express';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Inject(JwtService)
  private jwtService: JwtService;

  @Get('aaa')
  @UseGuards(LoginGuard)
  aaa() {
    return 'aaa';
  }

  @Post('bbb')
  bbb(@Res() res: Response) {
    res.send('bbb');
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body(ValidationPipe) user: LoginDto) {
    try {
      const foundUser = await this.userService.login(user);
      if(foundUser) {
        const token = await this.jwtService.signAsync({
          user: {
            id: foundUser.id,
            username: foundUser.username
          }
        })

        return {
          code: HttpStatus.OK,
          message: '登录成功',
          data: {
            token
          }
        };
      } else {
        return{
          code: HttpStatus.INTERNAL_SERVER_ERROR,
          message: '登录时出错',
        }
      }
    } catch (error) {
      return {
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        message: '登录时出错',
      }
    }
  }

  @Post('register')
  async register(@Body(ValidationPipe) user: RegisterDto) {
    return await this.userService.register(user);
  }

}
