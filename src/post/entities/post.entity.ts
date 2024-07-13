// import { TagEntity } from './../tag/entities/tag.entity';
// import { CategoryEntity } from './../category/entities/category.entity';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
// import { Exclude, Expose } from 'class-transformer';

@Entity('post')
export class PostsEntity {
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

  @Column('simple-enum', {
    enum: ['draft', 'publish'],
    comment: '文章状态',
  })
  status: string;

  // @Column({ type: 'timestamp', name: 'publish_time', default: null })
  // publishTime: Date;
  //
  // @Column({ type: 'timestamp', name: 'create_time', default: () => 'CURRENT_TIMESTAMP' })
  // createTime: Date;
  //
  // @Column({ type: 'timestamp',name: 'update_time', default: () => 'CURRENT_TIMESTAMP' })
  // updateTime: Date;

}