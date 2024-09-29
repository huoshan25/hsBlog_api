import { Module } from '@nestjs/common';
import { ArticleService } from './article.service';
import { ArticleController } from './article.controller'
import { TypeOrmModule } from "@nestjs/typeorm";
import { Article } from "./entities/article.entity";
import { Tag } from './entities/tag.entity';
import { Category } from '../category/entities/category.entity';
import { AliService } from '../oss/ali/ali.service';

@Module({
  imports: [
    // 引入 TypeOrm.forFeature 动态模块，传入 article 的 entity。
    TypeOrmModule.forFeature([Article, Tag, Category])
  ],
  controllers: [ArticleController],
  providers: [ArticleService, AliService],
  exports: [TypeOrmModule], // 确保导出 TypeOrmModule 以便其他模块可以使用 ArticleRepository 然后去分类模块导入文章模块
})
export class ArticleModule {}
