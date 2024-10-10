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


@Controller('blog/categories')
export class CategoryBlogController {
  constructor(
    private readonly categoryService: CategoryService,
  ) {}

}
