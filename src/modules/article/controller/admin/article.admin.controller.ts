import { Body, Controller, Delete, Get, HttpStatus, Post, Put, Query, ValidationPipe } from '@nestjs/common';
import { ArticleService } from '../../service/article.service';
import { FindArticlesDto } from '../../dto/find-articles.dto';
import { EditArticlesStatus } from '../../dto/edit-articles-status.dto';
import { UpdateArticleDto } from '../../dto/update-article.dto';
import { DeleteArticlesDto } from '../../dto/delete-article.dto';
import { CreateArticleDto } from '../../dto/create-article.dto';
import { ApiResponse } from '../../../../common/response';

@Controller('admin/article')
export class ArticleAdminController {
  constructor(
    private readonly articleService: ArticleService,
  ) {}

  @Get('list')
  async findAll(@Query(ValidationPipe) query: FindArticlesDto) {
    return await this.articleService.findAll(query);
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
        return new ApiResponse(HttpStatus.INTERNAL_SERVER_ERROR, `文章更新失败: ${result.message}`);
      }

      return new ApiResponse(HttpStatus.OK, '文章更新成功', result);
    } catch (error) {
      return new ApiResponse(HttpStatus.INTERNAL_SERVER_ERROR, `文章更新失败 ${error}`);
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
        return new ApiResponse(HttpStatus.INTERNAL_SERVER_ERROR, `文章创建失败: ${result.message}`);
      }

      return new ApiResponse(HttpStatus.OK, '文章创建成功', { id: result.id });
    } catch (error) {
      return new ApiResponse(HttpStatus.INTERNAL_SERVER_ERROR, '文章创建失败');
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
    return await this.articleService.findAllTags();
  }
}