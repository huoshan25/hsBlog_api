import { Body, Controller, Delete, Get, Post, Put, Query, ValidationPipe } from '@nestjs/common';
import { ArticleService } from '../../service/article.service';
import { FindArticlesDto } from '../../dto/find-articles.dto';
import { EditArticlesStatus } from '../../dto/edit-articles-status.dto';
import { UpdateArticleDto } from '../../dto/update-article.dto';
import { DeleteArticlesDto } from '../../dto/delete-article.dto';
import { CreateArticleDto } from '../../dto/create-article.dto';

@Controller('admin/article')
export class ArticleAdminController {
  constructor(private readonly articleService: ArticleService) {}

  @Get('list')
  async findAll(@Query(ValidationPipe) query: FindArticlesDto) {
    return await this.articleService.findAll(query);
  }

  @Put('status')
  async editArticlesStatus(@Body(ValidationPipe) editArticlesStatus: EditArticlesStatus) {
    return this.articleService.editArticlesStatus(editArticlesStatus);
  }

  @Put()
  async update(@Body(ValidationPipe) article: UpdateArticleDto) {
    return await this.articleService.updateArticle(article);
  }

  @Delete()
  async delete(@Body(ValidationPipe) deleteArticlesDto: DeleteArticlesDto) {
    return await this.articleService.deleteArticles(deleteArticlesDto);
  }

  @Post()
  async create(@Body(ValidationPipe) article: CreateArticleDto) {
    return await this.articleService.createArticle(article);
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