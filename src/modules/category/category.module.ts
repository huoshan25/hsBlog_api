import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryService } from './service/category.service';
import { Category } from './entities/category.entity';
import { ArticleModule } from "../article/article.module";
import { CategoryAdminController } from './controller/admin/category-admin.controller';
import { OssModule } from '../oss/oss.module';
import { CategoryBlogController } from './controller/blog/category-blog.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Category]),
    ArticleModule, //导入文章模块1
    OssModule
  ],
  controllers: [CategoryAdminController, CategoryBlogController],
  providers: [CategoryService],
})
export class CategoryModule {}
