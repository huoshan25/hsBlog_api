import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToMany
} from 'typeorm';
import { Article } from './article.entity';

@Entity()
export class Tag {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    unique: true,
    comment: '标签名称'
  })
  name: string;

  @ManyToMany(() => Article, article => article.tags)
  articles: Article[];
}
