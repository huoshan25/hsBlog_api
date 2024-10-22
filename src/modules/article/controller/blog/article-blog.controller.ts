import { Controller, Get, Query, ValidationPipe } from '@nestjs/common';
import { ArticleService } from '../../service/article.service';
import { TagService } from '../../../tag/service/tag.service';
import { SearchArticleDto } from '../../dto/search-article.dto';
import { ArticleSearchResponseVO } from '../../vo/article-search-response.vo';
import { FindArticlesDto } from '../../dto/find-articles.dto';

@Controller('blog/article')
export class ArticleBlogController {
  constructor(
    private readonly articleService: ArticleService,
  ) {
  }

  @Get('list')
  async findAll(@Query(ValidationPipe) query: FindArticlesDto) {
    const [articles, total] = await this.articleService.findAll(query);
    // 处理数据，将 category 信息解构到文章字段中，并整理标签
    const list = articles.map(article => {
      const { category_id, articleTags, ...articleData } = article;
      return {
        ...articleData,
        category_id: category_id ? category_id.id : null,
        category_name: category_id ? category_id.name : '未分类',
        tags: articleTags ? articleTags.map(at => at.tag).filter(Boolean) : [],
      };
    });
    return { data: { list, total} }
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