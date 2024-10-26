import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Article } from './article.entity';
import { Tag } from '../../tag/entities/tag.entity';

@Entity('article_tags')
export class ArticleTag {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Article, article => article.articleTags, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'article_id' })
  article: Article;

  @ManyToOne(() => Tag, tag => tag.articleTags)
  @JoinColumn({ name: 'tag_id' })
  tag: Tag;

  @CreateDateColumn()
  createdAt: Date;
}