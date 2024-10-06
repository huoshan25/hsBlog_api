// tag.entity.ts
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm';
import { ArticleTag } from './article-tab.entity';

@Entity()
export class Tag {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    unique: true,
    comment: '标签名称'
  })
  name: string;

  @OneToMany(() => ArticleTag, articleTag => articleTag.tag)
  articleTags: ArticleTag[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}