import { Controller, Get, Query, ValidationPipe } from '@nestjs/common';
import { ArticleService } from '../../service/article.service';
import { TagService } from '../../../tag/service/tag.service';
import { SearchArticleDto } from '../../dto/search-article.dto';
import { ArticleSearchResponseVO } from '../../vo/article-search-response.vo';
import { FindArticlesDto } from '../../dto/find-articles.dto';
import { CursorArticlesDto } from '../../dto/cursor-articles.dto';
import { plainToClass } from 'class-transformer';

@Controller('blog/article')
export class ArticleBlogController {
  constructor(
    private readonly articleService: ArticleService,
  ) {
  }

  @Get('list')
  async findPublicArticles(@Query(ValidationPipe) query: CursorArticlesDto) {
    const { list, cursor, hasMore } = await this.articleService.findPublicArticles(query);
    return {
      data: {
        list,
        cursor,
        hasMore
      }
    };
  }

  @Get('search-select')
  async searchArticleSelect(@Query(ValidationPipe) searchArticleDto: SearchArticleDto) {
    const result = await this.articleService.searchArticlesSelect(searchArticleDto);
    const data = result.map(article => ({
      id: article.id,
      title: article.title,
    }));
    return {
      data
    };
  }

  @Get('search')
  async searchArticles(@Query(ValidationPipe) searchArticleDto: SearchArticleDto) {
    const result = await this.articleService.searchArticles(searchArticleDto);
    const data = result.map(article => plainToClass(ArticleSearchResponseVO, article, { excludeExtraneousValues: true }))
    return {
      data,
    };
  }

  @Get('tags')
  async findAllTags() {
    const {tag_list, tag_total, article_total} = await this.articleService.findAllTags();
    return {
      data: {
        tag_list,
        tag_total,
        article_total
      }
    }
  }

  @Get('details')
  async articleDetails(
    @Query('id') id: number,
  ) {
    return await this.articleService.articleDetails(id);
  }

  @Get('article-id-list')
  async findHotArticles() {
    const result = await this.articleService.getAllArticleIds();
    return {
      data: result
    }
  }
}