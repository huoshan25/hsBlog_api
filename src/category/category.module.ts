import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { Category } from './entities/category.entity';
import { ArticleModule } from "../article/article.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Category]),
    ArticleModule, //导入文章模块1
  ],
  controllers: [CategoryController],
  providers: [CategoryService],
})
export class CategoryModule {}
