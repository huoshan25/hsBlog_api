// import { TagEntity } from './../tag/entities/tag.entity';
// import { CategoryEntity } from './../category/entities/category.entity';
import {
  Column, CreateDateColumn,
  Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne,
  PrimaryGeneratedColumn, UpdateDateColumn,
} from 'typeorm';
import { Category } from "../../category/entities/category.entity";
import { Tag } from './tag.entity';
// import { Exclude, Expose } from 'class-transformer';

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
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: '简要内容'
  })
  brief_content?: string;

  @ManyToOne(() => Category, category => category.articles)
  @JoinColumn({ name: 'category_id' }) // 自定义外键字段名
  category_id: Category;

  //在 Article 实体中添加与 Tag 的多对多关系
  @ManyToMany(() => Tag, tag => tag.articles, { cascade: true })
  @JoinTable({
    name: 'article_tags',
    joinColumn: {
      name: 'article_id',
      referencedColumnName: 'id'
    },
    inverseJoinColumn: {
      name: 'tag_id',
      referencedColumnName: 'id'
    }
  })
  tags: Tag[];
}