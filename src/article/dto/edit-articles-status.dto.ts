import { IsArray, IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
import { ArticleStatus } from '../entities/article.entity';
import { Transform } from 'class-transformer';

export class EditArticlesStatus {
  @IsArray()
  @IsNotEmpty({ message: "文章id必填" })
  @IsNumber({}, { each: true })
  readonly ids: number[];

  @IsNotEmpty({ message: "文章状态必填" })
  @IsEnum(ArticleStatus, { message: "错误状态码" })
  @Transform(({ value }) => parseInt(value, 10))
  readonly status: number;
}
