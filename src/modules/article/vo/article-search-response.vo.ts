import { Exclude, Expose, Transform } from 'class-transformer';

export class ArticleSearchResponseVO {
  @Expose()
  id: number;

  @Expose()
  title: string;

  @Expose()
  title_highlight: string;

  @Expose()
  content_highlight: string;

  @Expose()
  category_id: number;

  @Expose()
  category_name: string;

  @Expose()
  category_alias: string;

  @Expose()
  @Transform(({ value }) => value.map(tag => tag.name))
  tags: string[];

  @Expose()
  publish_time: string;

  @Expose()
  getFormattedTags(): string {
    return this.tags.join(', ');
  }
}