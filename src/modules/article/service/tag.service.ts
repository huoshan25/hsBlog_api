import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';
import { Tag } from '../entities/tag.entity';
import { Article } from '../entities/article.entity';
import { ArticleTag } from '../entities/article-tab.entity';

@Injectable()
export class TagService {
  constructor(
    @InjectRepository(Tag)
    private tagRepository: Repository<Tag>,

    @InjectRepository(ArticleTag)
    private articleTagRepository: Repository<ArticleTag>,
  ) {}

  /**
   * 处理文章标签
   * @param article 文章对象
   * @param tagNames 标签名称数组
   * @param entityManager 实体管理器
   */
  async handleArticleTags(article: Article, tagNames: string[], entityManager: EntityManager): Promise<void> {
    // 查找现有标签
    const existingTags = await entityManager.find(Tag, { where: { name: In(tagNames) } });
    const existingTagNames = existingTags.map(tag => tag.name);

    // 创建新标签
    const newTagNames = tagNames.filter(name => !existingTagNames.includes(name));
    const newTags = newTagNames.map(name => entityManager.create(Tag, { name }));
    if (newTags.length > 0) {
      await entityManager.save(Tag, newTags);
    }

    // 组合所有标签并创建文章标签关联
    const allTags = [...existingTags, ...newTags];
    const articleTags = allTags.map(tag => entityManager.create(ArticleTag, { article, tag }));

    // 插入文章标签关联，忽略重复项
    await entityManager.createQueryBuilder()
      .insert()
      .into(ArticleTag)
      .values(articleTags)
      .orIgnore()
      .execute();
  }

  /**
   * 更新文章标签
   * @param article 文章对象
   * @param newTagNames 新标记名称的数组
   * @param entityManager 可选实体管理器
   */
  async updateArticleTags(article: Article, newTagNames: string[], entityManager?: EntityManager): Promise<void> {
    const manager = entityManager || this.articleTagRepository.manager;

    // 获取当前文章标签
    const currentArticleTags = await manager.find(ArticleTag, {
      where: { article: { id: article.id } },
      relations: ['tag']
    });
    const currentTagNames = currentArticleTags.map(at => at.tag.name);

    // 确定要添加和删除的标签
    const tagsToAdd = newTagNames.filter(name => !currentTagNames.includes(name));
    const tagsToRemove = currentTagNames.filter(name => !newTagNames.includes(name));

    // 删除不必要的标签关联
    if (tagsToRemove.length > 0) {
      await manager.delete(ArticleTag, {
        article: { id: article.id },
        tag: { name: In(tagsToRemove) }
      });
    }

    // 添加新标签
    if (tagsToAdd.length > 0) {
      // 查找或创建新标签
      const newTags = await Promise.all(tagsToAdd.map(async name => {
        let tag = await manager.findOne(Tag, { where: { name } });
        if (!tag) {
          tag = manager.create(Tag, { name });
          await manager.save(Tag, tag);
        }
        return tag;
      }));

      // 创建新的文章标签关联
      const newArticleTags = newTags.map(tag => manager.create(ArticleTag, { article, tag }));
      await manager.save(ArticleTag, newArticleTags);
    }
  }
}