import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  OneToMany
} from "typeorm";
import { Article } from "../../article/entities/article.entity";

@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    comment: "分类名称"
  })
  name: string;

  @Column({
    comment: "分类别名"
  })
  alias: string;

  @Column({
    comment: "分类图标"
  })
  icon: string;

  @Column({
    type: "int",
    default: 0,
    comment: "排序"
  })
  sort: number;

  @CreateDateColumn({
    comment: "创建时间"
  })
  creation_time: Date;

  @UpdateDateColumn({
    comment: "更新时间"
  })
  update_time: Date;

  @Column({
    type: "boolean",
    default: true,
    comment: "是否可以编辑"
  })
  isEdit: boolean;

  @OneToMany(() => Article, article => article.category_id)
  articles: Article[];
}
