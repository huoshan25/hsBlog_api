import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Query, ValidationPipe } from '@nestjs/common';
import { ArticleService } from '../../service/article.service';
import { FindArticlesDto } from '../../dto/find-articles.dto';
import { EditArticlesStatus } from '../../dto/edit-articles-status.dto';
import { UpdateArticleDto } from '../../dto/update-article.dto';
import { DeleteArticlesDto } from '../../dto/delete-article.dto';
import { CreateArticleDto } from '../../dto/create-article.dto';
import { ApiResponse } from '../../../../common/response';
import { TagService } from '../../service/tag.service';

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

  @Delete()
  async delete(@Body(ValidationPipe) deleteArticlesDto: DeleteArticlesDto) {
    return await this.articleService.deleteArticles(deleteArticlesDto);
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
    @Query('category_id') categoryId: number,
  ) {
    return await this.articleService.articleDetails(id, categoryId);
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
}