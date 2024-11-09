import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Profile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    nullable: true,
  })
  name: string;

  @Column({
    nullable: true,
  })
  title: string;

  @Column({
    nullable: true,
    type: 'text',
  })
  description: string;

  @Column({
    type: 'simple-array',
    nullable: true,
    charset: 'utf8mb4',
    collation: 'utf8mb4_unicode_ci'
  })
  bio: string[];

  @Column({
    type: 'json',
    nullable: true,
  })
  skills: {
    name: string;
    items: { name: string }[];
  }[];

  @Column({
    type: 'json',
    nullable: true,
  })
  projects: {
    name: string;
    description: string;
    tech: string[];
    link: string;
  }[];

  @Column({
    type: 'json',
    nullable: true,
  })
  contacts: {
    platform: string;
    link: string;
    icon: string;
  }[];

  @Column({
    type: 'json',
    nullable: true
  })
  seo: {
    title: string;
    description: string;
    keywords: string;
    ogDescription: string;
    twitterDescription: string;
  };
}