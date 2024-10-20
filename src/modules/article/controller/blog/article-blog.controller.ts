import { Controller, Get, Query, ValidationPipe } from '@nestjs/common';
import { ArticleService } from '../../service/article.service';
import { TagService } from '../../../tag/service/tag.service';
import { SearchArticleDto } from '../../dto/search-article.dto';
import { ArticleSearchResponseVO } from '../../vo/article-search-response.vo';

@Controller('blog/article')
export class ArticleBlogController {
  constructor(
    private readonly articleService: ArticleService,
  ) {
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
    console.log(result,'result');
    const data = result.map(article => new ArticleSearchResponseVO(article));
    return {
      data,
    };
  }
}