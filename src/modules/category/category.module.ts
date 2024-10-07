import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryService } from './service/category.service';
import { Category } from './entities/category.entity';
import { ArticleModule } from "../article/article.module";
import { CategoryAdminController } from './controller/admin/categoryAdmin.controller';
import { OssModule } from '../oss/oss.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Category]),
    ArticleModule, //导入文章模块1
    OssModule
  ],
  controllers: [CategoryAdminController],
  providers: [CategoryService],
})
export class CategoryModule {}
