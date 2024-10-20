import { IsNotEmpty } from 'class-validator';

export class SearchArticleDto {
  @IsNotEmpty({ message: '搜索内容必填' })
  keyword: string;
}
