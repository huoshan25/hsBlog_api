import { Module } from '@nestjs/common';
import { UserService } from './service/user.service';
import { UserAdminController } from './controller/admin/user-admin.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { AuthService } from './service/auth.service';
import { UserRepository } from './repositories/user.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [UserAdminController],
  providers: [UserService, AuthService, UserRepository],
})
export class UserModule {}