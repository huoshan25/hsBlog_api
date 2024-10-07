import { Body, Controller, Delete, Get, HttpStatus, Post, Put, Query, ValidationPipe } from '@nestjs/common';
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
    return new ApiResponse(HttpStatus.OK, '查询成功', { list, total });
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
    const {tag_list, tag_total, article_total} = await this.articleService.findAllTags();
    return new ApiResponse(HttpStatus.OK, '操作成功', { tag_list, tag_total, article_total });
  }
}