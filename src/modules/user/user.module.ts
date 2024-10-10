import { Module } from '@nestjs/common';
import { UserService } from './service/user.service';
import { UserAdminController } from './controller/admin/user-admin.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { AuthService } from './service/auth.service';

@Module({
  imports: [
    // 引入 TypeOrm.forFeature 动态模块，传入 User 的 entity。
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [UserAdminController],
  providers: [UserService, AuthService],
})
export class UserModule {}
