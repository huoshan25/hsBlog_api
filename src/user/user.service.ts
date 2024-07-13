import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import * as crypto from 'crypto'
import { LoginDto } from './dto/login.dto';

/**
 * 加密
 * @param str
 */
const md5 = (str: string) => {
  /**
   * 这里使用node内置的crypto包
   */
  const hash = crypto.createHash('md5');
  hash.update(str)
  return hash.digest('hex');
}

@Injectable()
export class UserService {

  @InjectRepository(User)
  private userRepository: Repository<User>;
  private logger = new Logger();

  /**
   * 登录
   * @param user
   */
  async login(user: LoginDto) {
    const foundUser: User = await this.userRepository.findOneBy({
      username: user.username,
    })

    if(!foundUser){
      throw new HttpException('用户名不存在', HttpStatus.NOT_FOUND);
    }

    if(foundUser.password !== md5(user.password)) {
      throw new HttpException('密码错误', HttpStatus.INTERNAL_SERVER_ERROR)
    }

    return foundUser
  }

  /**
   * 注册
   * @param user
   */
  async register(user: RegisterDto) {

    // 注册先查询是否有相同name
    const foundUser = await this.userRepository.findOneBy({
      username: user.username
    })

    if(foundUser){
      throw new HttpException('用户名已存在', HttpStatus.CONFLICT);
    }

    const newUser = new User()
    newUser.username =user.username
    newUser.password = md5(user.password)

    try {
      await this.userRepository.save(newUser)
      return {
        code: HttpStatus.OK,
        message: '注册成功'
      }
    } catch(error) {
      this.logger.error(error, UserService)
      return {
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        message: '注册失败'
      }
    }
  }

}
