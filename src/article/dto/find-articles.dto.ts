import { IsArray, IsEnum, IsInt, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ArticleStatus } from '../entities/article.entity';

export class FindArticlesDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1000)
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number;

  @IsOptional()
  id?: number;

  @IsOptional()
  @Max(100)
  title?: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  status?: number;

  @IsOptional()
  @IsString()
  keyword?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tagNames?: string[];

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  categoryId?: number;
}
