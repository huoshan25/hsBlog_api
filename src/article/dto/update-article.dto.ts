import { PartialType } from '@nestjs/mapped-types';
import { CreateArticleDto } from './create-article.dto';
import { IsNotEmpty } from 'class-validator';

export class UpdateArticleDto extends PartialType(CreateArticleDto) {
  @IsNotEmpty({ message: "文章id必传" })
  readonly id: number;
}