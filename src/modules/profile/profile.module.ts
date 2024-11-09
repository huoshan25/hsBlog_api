import { Module } from '@nestjs/common';
import { ProfileBlogController } from './controller/blog/profile-blog.controller';
import { ProfileAdminController } from './controller/admin/profile-admin.controller';
import { ProfileService } from './service/profile.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Profile } from './entities/profile.entity';


@Module({
  imports: [
    TypeOrmModule.forFeature([Profile]),
  ],
  controllers: [ProfileBlogController, ProfileAdminController],
  providers: [ProfileService],
})

export class ProfileModule {}