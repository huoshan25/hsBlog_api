import { forwardRef, Module } from '@nestjs/common';
import { TagService } from './service/tag.service';
import { ArticleModule } from '../article/article.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tag } from './entities/tag.entity';
import { TagBlogController } from './blog/tag-blog.controller';
import { TagAdminController } from './admin/tag-admin.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tag]),
    forwardRef(() => ArticleModule),
  ],
  controllers: [TagBlogController, TagAdminController],
  providers: [TagService],
  exports: [TagService, TypeOrmModule],
})
export class TagModule {}
