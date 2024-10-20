import { Module } from '@nestjs/common';
import { UserService } from './service/user.service';
import { UserAdminController } from './controller/admin/user-admin.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { AuthService } from './service/auth.service';
import { UserRepository } from './repositories/user.repository';
import { UserBlogController } from './controller/blog/user-blog.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [UserAdminController, UserBlogController],
  providers: [UserService, AuthService, UserRepository],
})
export class UserModule {}