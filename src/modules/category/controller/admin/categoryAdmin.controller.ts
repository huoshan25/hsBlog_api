import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  HttpStatus,
  UseInterceptors,
  UploadedFile, ValidationPipe, BadRequestException,
} from '@nestjs/common';
import { ApiResponse } from 'src/common/response';
import { FileInterceptor } from '@nestjs/platform-express';
import { CategoryService } from '../../service/category.service';
import { CreateCategoryDto } from '../../dto/create-category.dto';
import { UpdateCategoryDto } from '../../dto/update-category.dto';
import { DeleteCategoryDto } from '../../dto/delete-category.dto';
import { FileValidationUtil } from '../../../../utils/file-validation.util';


@Controller('admin/category')
export class CategoryAdminController {
  constructor(
    private readonly categoryService: CategoryService,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('category_image'))
  async createCategory(
    @UploadedFile() category_image: Express.Multer.File,
    @Body() createCategoryDto: CreateCategoryDto
  ) {

    if (!category_image) {
      throw new BadRequestException('没有上传文件');
    }

    if (!FileValidationUtil.isImage(category_image)) {
      throw new BadRequestException('文件类型必须是图片');
    }

    try {
      await this.categoryService.createCategoryWithImage(createCategoryDto, category_image)
      return new ApiResponse(HttpStatus.OK, '新增分类成功')
    } catch (error) {
      return new ApiResponse(HttpStatus.BAD_REQUEST, `新增失败: ${error}`)
    }
  }

  @Get()
  findAll() {
    return this.categoryService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.categoryService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.categoryService.update(id, updateCategoryDto);
  }

  @Delete()
  delete(@Param(ValidationPipe) deleteCategory: DeleteCategoryDto) {
    return this.categoryService.deleteCategory(deleteCategory);
  }

  @Get(':id/articles')
  async findArticles(@Param('id') id: number) {
    const result = await this.categoryService.findArticles(id);
    return result;
  }
}
