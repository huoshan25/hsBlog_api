import { Logger, Module } from '@nestjs/common';
import { ArticleService } from './service/article.service';
import { TypeOrmModule } from "@nestjs/typeorm";
import { Article } from "./entities/article.entity";
import { Tag } from './entities/tag.entity';
import { Category } from '../category/entities/category.entity';
import { OssModule } from '../oss/oss.module';
import { ArticleAdminController } from './controller/admin/article.admin.controller';
import { ArticleBlogController } from './controller/blog/article.blog.controller';
import { TagService } from './service/tag.service';
import { ArticleTag } from './entities/article-tab.entity';

@Module({
  imports: [
    // 引入 TypeOrm.forFeature 动态模块，传入 article 的 entity。
    TypeOrmModule.forFeature([Article, Tag, Category, ArticleTag]),
    OssModule,
  ],
  controllers: [ArticleAdminController, ArticleBlogController],
  providers: [ArticleService, TagService, Logger],
  exports: [TypeOrmModule], // 确保导出 TypeOrmModule 以便其他模块可以使用 ArticleRepository 然后去分类模块导入文章模块
})
export class ArticleModule {}
