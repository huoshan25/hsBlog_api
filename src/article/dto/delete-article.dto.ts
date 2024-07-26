import { IsArray, IsNumber } from 'class-validator';

export class DeleteArticlesDto {
  @IsArray()
  @IsNumber({}, { each: true })
  ids: number[];
}
