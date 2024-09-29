import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';
import { Match } from './match.decorator'
export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @Length(6,30)
  @Matches(/^[a-zA-Z0-9]+$/, {
    message: '用户名只能是字母、数字或者 #、$、%、_、- 这些字符',
  })
  username: string;

  @IsString()
  @IsNotEmpty()
  @Length(6,30)
  password: string;

  @IsString()
  @IsNotEmpty()
  @Match('password', { message: '两次输入的密码不一致' })
  confirmPassword: string;
}