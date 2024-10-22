import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile, ValidationPipe,
} from '@nestjs/common';
import { CategoryService } from '../../service/category.service';


@Controller('blog/category')
export class CategoryBlogController {
  constructor(
    private readonly categoryService: CategoryService,
  ) {}

  @Get()
  async findAll() {
    const result = await this.categoryService.findAll()
    return { data: result }
  }

}
