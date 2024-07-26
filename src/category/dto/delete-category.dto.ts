import { IsArray, IsNumber } from 'class-validator';

export class DeleteCategoryDto {
  @IsArray()
  @IsNumber({}, { each: true })
  ids: number[];
}
