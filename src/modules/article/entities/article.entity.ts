import {
  Column, CreateDateColumn,
  Entity, JoinColumn, ManyToOne, OneToMany,
  PrimaryGeneratedColumn, UpdateDateColumn,
} from 'typeorm';
import { Category } from "../../category/entities/category.entity";
import { ArticleTag } from './article-tag.entity';

/**文章状态*/
export enum ArticleStatus {
  /**草稿*/
  DRAFT = 1,
  /**发布*/
  PUBLISH = 2,
  /**删除*/
  DELETE = 3,
}

@Entity()
export class Article {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    length: 50,
    comment: '文章标题',
  })
  title: string;

  @Column({
    type: 'mediumtext',
    default: null,
    comment: 'markdown内容',
  })
  content: string;

  @Column( {
    type: 'enum',
    enum: ArticleStatus,
    comment: '文章状态',
  })
  status: ArticleStatus;

  @CreateDateColumn({
    comment: '创建时间'
  })
  create_time: Date;

  @UpdateDateColumn({
    comment: '更新时间'
  })
  update_time: Date;

  @Column({
    type: 'datetime',
    nullable: true,
    comment: '发布时间'
  })
  publish_time: Date;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: '简要内容'
  })
  brief_content?: string;

  @ManyToOne(() => Category, category => category.articles)
  @JoinColumn({ name: 'category_id' })
  category_id: Category;

  @OneToMany(() => ArticleTag, articleTag => articleTag.article)
  articleTags: ArticleTag[];
}