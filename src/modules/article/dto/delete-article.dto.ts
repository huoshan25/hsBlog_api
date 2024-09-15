import { IsNumber } from 'class-validator';

export class DeleteArticlesDto {
  @IsNumber()
  id: number;
}
