import {
  Column, CreateDateColumn,
  Entity, JoinColumn, ManyToOne, OneToMany,
  PrimaryGeneratedColumn, UpdateDateColumn,
} from 'typeorm';
import { Category } from '../../category/entities/category.entity';
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

export enum ArticleType {
  /*原创*/
  ORIGINAL = 1,
  /*外链*/
  EXTERNAL = 2
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

  @Column({
    type: 'tinyint',
    comment: '文章状态: 1-草稿 2-已发布 3-已删除',
    default: ArticleStatus.PUBLISH
  })
  status: ArticleStatus;

  @CreateDateColumn({
    comment: '创建时间',
  })
  create_time: Date;

  @UpdateDateColumn({
    comment: '更新时间',
  })
  update_time: Date;

  @Column({
    type: 'datetime',
    nullable: true,
    comment: '发布时间',
  })
  publish_time: Date;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: '文章描述',
  })
  description: string;

  @ManyToOne(() => Category, category => category.articles)
  @JoinColumn({ name: 'category_id' })
  category_id: Category;

  @OneToMany(() => ArticleTag, articleTag => articleTag.article, {
    cascade: true, // 添加级联操作
    onDelete: 'CASCADE', // 添加级联删除
  })
  articleTags: ArticleTag[];

   @Column({
     length: 330,
     nullable: true,
     comment: '文章概要文本',
   })
   short_content: string

  @Column({
    nullable: true,
    comment: '文章概要音频',
  })
  short_audio_url: string

  @Column({
    type: 'text',
    nullable: true,
    comment: '文章对话文本',
  })
  long_content: string

  @Column({
    nullable: true,
    comment: '文章对话音频',
  })
  long_audio_url: string

  @Column({
    type: 'tinyint',
    comment: '文章类型：1-原创，2-外链',
    default: ArticleType.ORIGINAL,
  })
  type: ArticleType;

  @Column({
    nullable: true,
    length: 500,
    comment: '外链地址'
  })
  link_url: string;

  @Column({
    type: 'int',
    unsigned: true,
    default: 0,
    comment: '文章浏览数'
  })
  view_count: number;
}