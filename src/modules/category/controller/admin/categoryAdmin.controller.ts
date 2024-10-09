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
      return { message: '新增分类成功' }
    } catch (error) {
      return { code: HttpStatus.BAD_REQUEST, message: `新增失败: ${error}`}
    }
  }

  @Get()
  async findAll() {
    const result = await this.categoryService.findAll()
    return { data: result }
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    const result = await this.categoryService.findCategoryById(id)
    return {
      code: HttpStatus.OK,
      data: result
    }
  }

  @Put()
  update(@Body() updateCategoryDto: UpdateCategoryDto) {
    return this.categoryService.update(updateCategoryDto);
  }

  @Delete()
  delete(@Param(ValidationPipe) deleteCategory: DeleteCategoryDto) {
    return this.categoryService.deleteCategory(deleteCategory);
  }
}
