import { Controller, Get, Query, ValidationPipe } from '@nestjs/common';
import { TagService } from '../service/tag.service';
import { GetArticlesByTagDto } from '../dto/get-articles-by-tag.dto';

@Controller('admin/tag')
export class TagAdminController {
  constructor(private readonly tagService: TagService) {
  }

  @Get('stats')
  async getTagsStats() {
    const data = await this.tagService.getTagsStats();
    return { data };
  }

  @Get('trend')
  async getTagsTrend() {
    const data = await this.tagService.getTagsTrend();
    return { data };
  }

  @Get('relation')
  async getTagsRelation() {
    const data = await this.tagService.getTagsRelation();
    return { data };
  }
}
