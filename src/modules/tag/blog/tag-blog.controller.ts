import { Controller, Get, Query, ValidationPipe } from '@nestjs/common';
import { TagService } from '../service/tag.service';
import { GetArticlesByTagDto } from '../dto/get-articles-by-tag.dto';

@Controller('blog/tag')
export class TagBlogController {
  constructor(private readonly tagService: TagService) {
  }

  @Get('articles')
  async getArticlesByTagName(@Query(ValidationPipe) getArticlesDto: GetArticlesByTagDto) {
    const { data } = await this.tagService.getArticlesByTagName(
      getArticlesDto.tagName,
      getArticlesDto.page,
      getArticlesDto.limit,
    );

    return { data };
  }

  @Get()
  async getAllTags() {
    const [list, total] = await this.tagService.getAllTags();
    const data = {
      list,
      total,
    };
    return { data };
  }
}
