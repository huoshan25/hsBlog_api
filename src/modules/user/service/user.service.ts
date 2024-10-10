import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import * as crypto from 'crypto';
import { UserRepository } from '../repositories/user.repository';

const md5 = (str: string) => {
  const hash = crypto.createHash('md5');
  hash.update(str);
  return hash.digest('hex');
};

@Injectable()
export class UserService {
  constructor(private userRepository: UserRepository) {}
  private logger = new Logger(UserService.name);

  async validateUser(loginDto: LoginDto): Promise<User> {
    const foundUser = await this.userRepository.findByUsername(loginDto.username);

    if (!foundUser) {
      throw new HttpException('用户名不存在', HttpStatus.NOT_FOUND);
    }

    if (foundUser.password !== md5(loginDto.password)) {
      throw new HttpException('密码错误', HttpStatus.UNAUTHORIZED);
    }

    return foundUser;
  }

  async createUser(registerDto: RegisterDto): Promise<User> {
    const foundUser = await this.userRepository.findByUsername(registerDto.username);

    if (foundUser) {
      throw new HttpException('用户名已存在', HttpStatus.CONFLICT);
    }

    const newUser = new User();
    newUser.username = registerDto.username;
    newUser.password = md5(registerDto.password);

    try {
      return await this.userRepository.save(newUser);
    } catch (error) {
      this.logger.error(error);
      throw new HttpException('注册失败', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findById(id: number): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new HttpException('用户不存在', HttpStatus.NOT_FOUND);
    }
    return user;
  }
}