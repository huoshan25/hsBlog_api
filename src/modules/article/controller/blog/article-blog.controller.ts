import { Controller, Get, Query, ValidationPipe } from '@nestjs/common';
import { ArticleService } from '../../service/article.service';
import { TagService } from '../../../tag/service/tag.service';
import { SearchArticleDto } from '../../dto/search-article.dto';

@Controller('blog/article')
export class ArticleBlogController {
  constructor(
    private readonly articleService: ArticleService,
  ) {}

  @Get('search')
  async searchArticles(@Query(ValidationPipe) searchArticleDto: SearchArticleDto) {
    const result = await this.articleService.searchArticles(searchArticleDto);
    return {
      data: result
    }
  }
}