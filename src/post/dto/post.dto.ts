import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreatePostDto {
  @IsNotEmpty({ message: '文章标题必填' })
  readonly title: string;

  readonly content: string;

  readonly coverUrl: string;

  readonly status: string;

  @IsNumber()
  readonly category: number;

  readonly isRecommend: boolean;

  readonly tag: string;
}

export class PostInfoDto {
  public id: number;
  public title: string;
  public content: string;
  public contentHtml: string;
  public summary: string;
  public toc: string;
  public coverUrl: string;
  public isRecommend: boolean;
  public status: string;
  public userId: string;
  public author: string;
  public category: string;
  public tags: string[];
  public count: number;
  public likeCount: number;
}

export interface PostsRo {
  list: PostInfoDto[];
  count: number;
}