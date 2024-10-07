import {IsNotEmpty} from 'class-validator';

export class CreateCategoryDto {
  @IsNotEmpty({ message: "分类名称必填" })
  readonly name: string;

  @IsNotEmpty({ message: "Alias必填" })
  readonly alias: string;

  @IsNotEmpty({ message: "排序必填" })
  readonly sort: number;
}
