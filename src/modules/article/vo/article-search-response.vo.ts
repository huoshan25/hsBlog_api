export class ArticleSearchResponseVO {
  id: number;
  title: string;
  title_highlight: string;
  content_highlight: string;
  category_id: number;
  category_name: string;
  category_alias: string;
  tags: string[];
  publish_time: string;

  constructor(article: any) {
    this.id = article.id;
    this.publish_time = article.publish_time;
    this.title_highlight = article.title_highlight;
    this.content_highlight = article.content_highlight;
    this.category_id = article.category_id;
    this.category_name = article.category_name;
    this.category_alias = article.category_alias;
    this.tags = article.tags.map(tag => tag.name);
  }

  getFormattedTags(): string {
    return this.tags.join(', ');
  }
}