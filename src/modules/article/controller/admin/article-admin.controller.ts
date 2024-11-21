import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { ArticleService } from '../../service/article.service';
import { FindArticlesDto } from '../../dto/find-articles.dto';
import { EditArticlesStatus } from '../../dto/edit-articles-status.dto';
import { UpdateArticleDto } from '../../dto/update-article.dto';
import { DeleteArticlesDto } from '../../dto/delete-article.dto';
import { CreateArticleDto } from '../../dto/create-article.dto';
import { ApiResponse } from '../../../../common/response';
import { TagService } from '../../../tag/service/tag.service';
import { CreateArticleTtsDto } from '../../dto/caeate-article-tts.dto';

@Controller('admin/article')
export class ArticleAdminController {
  constructor(
    private readonly articleService: ArticleService,
    private readonly tagService: TagService,
  ) {}

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

  @Put('status')
  async editArticlesStatus(@Body(ValidationPipe) editArticlesStatus: EditArticlesStatus) {
    return this.articleService.editArticlesStatus(editArticlesStatus);
  }

  @Put()
  async updateArticle(@Body(ValidationPipe) article: UpdateArticleDto) {
    try {
      const result = await this.articleService.updateArticle(article);

      if (result instanceof Error) {
        return { code: HttpStatus.INTERNAL_SERVER_ERROR, message: `文章更新失败: ${result.message}`}
      }

      return { message: '文章更新成功', data: result}
    } catch (error) {
      return { code: HttpStatus.INTERNAL_SERVER_ERROR, message: '文章更新失败'}
    }
  }

  /*删除文章*/
  @Delete()
  async delete(@Body(ValidationPipe) deleteArticlesDto: DeleteArticlesDto) {
     await this.articleService.deleteArticles(deleteArticlesDto);
     return { message: '删除成功'}
  }

  @Post()
  async createArticle(@Body() article: CreateArticleDto) {
    try {
      const result = await this.articleService.createArticle(article);

      if (result instanceof Error) {
        return { code: HttpStatus.INTERNAL_SERVER_ERROR, message: `文章创建失败: ${result.message}`}
      }

      return { message: '文章创建成功', data: { id: result.id}}
    } catch (error) {
      return { code: HttpStatus.INTERNAL_SERVER_ERROR, message: '文章创建失败'}
    }
  }

  @Get('details')
  async articleDetails(
    @Query('id') id: number,
  ) {
    return await this.articleService.articleDetails(id);
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

  @Post('update-publish-time')
  @HttpCode(HttpStatus.OK)
  async updatePublishTime(
    @Body('id') id: number,
    @Body('publish_time') publishTime: string
  ) {
    const newPublishTime = publishTime ? new Date(publishTime) : null;
    const result = await this.articleService.updateArticlePublishTime(id, newPublishTime);
    if(result) {
      return { message: '更新成功' }
    }
  }

  @Put('tts')
  async updateTts(
    @Body() articleTTS: CreateArticleTtsDto
  ) {
    const result = await this.articleService.updateArticleTTS(articleTTS);
    if(result) {
      return { message: '更新成功' }
    }
  }

  @Get('stats/trend')
  async getArticlePublishTrend() {
    const data = await this.articleService.getArticlePublishTrend();
    return { data };
  }

  @Get('stats/category')
  async getArticleCategoryStats() {
    const data = await this.articleService.getArticleCategoryStats();
    return { data };
  }

  @Get('stats/hot')
  async getHotArticles() {
    const data = await this.articleService.getHotArticles();
    return { data };
  }

  @Get('stats/time-distribution')
  async getArticleTimeDistribution() {
    const data = await this.articleService.getArticleTimeDistribution();
    return { data };
  }

  @Get('stats/overview')
  async getArticleOverview() {
    const data = await this.articleService.getArticleOverview();
    return { data };
  }

  @Get('stats/words')
  async getArticleWordsDistribution() {
    const data = await this.articleService.getArticleWordsDistribution();
    return { data };
  }
}