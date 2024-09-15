import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ArticleStatus } from '../entities/article.entity';
import { IsEnumNumber } from 'src/common/decorators/dto/is-enum-number.decorator';
import { Transform } from 'class-transformer';
import { Category } from '../../category/entities/category.entity';

export class CreateArticleDto {
  @IsNotEmpty({ message: "文章标题必填" })
  readonly title: string;

  @IsNotEmpty({ message: "文章内容必填" })
  readonly content: string;

  @IsNotEmpty({ message: "文章分类必填" })
  readonly category_id: Category;

  @IsNotEmpty({ message: "缺少文章摘要" })
  @MaxLength(255, { message: "文章摘要不能超过255个字符" })
  readonly brief_content: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  readonly tagNames?: string[];

  @IsNotEmpty({ message: "文章状态必填" })
  @IsEnum(ArticleStatus, { message: "错误状态码" })
  @Transform(({ value }) => parseInt(value, 10))
  // @IsEnumNumber(ArticleStatus, { message: "错误状态码" })
  readonly status: number;
}