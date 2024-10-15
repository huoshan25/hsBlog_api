import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';
import { Tag } from '../entities/tag.entity';
import { ArticleTag } from '../../article/entities/article-tag.entity';
import { Article } from '../../article/entities/article.entity';

@Injectable()
export class TagService {
  private readonly logger = new Logger(TagService.name);

  constructor(
    @InjectRepository(Tag)
    private tagRepository: Repository<Tag>,

    @InjectRepository(ArticleTag)
    private articleTagRepository: Repository<ArticleTag>,
  ) {}

  /**
   * 获取所有标签
   */
  async getAllTags() {
    return this.tagRepository.findAndCount();
  }

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
   * 更新文章的标签
   * @param article 要更新标签的文章
   * @param newTagNames 新的标签名称数组
   * @param entityManager 可选的实体管理器，用于事务控制
   */
  async updateArticleTags(article: Article, newTagNames: string[], entityManager?: EntityManager): Promise<void> {
    const manager = entityManager || this.articleTagRepository.manager;

    await manager.transaction(async transactionalEntityManager => {
      // 获取当前文章的所有标签
      const currentArticleTags = await transactionalEntityManager.find(ArticleTag, {
        where: { article: { id: article.id } },
        relations: ['tag']
      });
      const currentTagNames = currentArticleTags.map(at => at.tag.name);

      // 确定需要添加和删除的标签
      const tagsToAdd = newTagNames.filter(name => !currentTagNames.includes(name));
      const tagsToRemove = currentTagNames.filter(name => !newTagNames.includes(name));

      // 删除不再需要的标签关联
      if (tagsToRemove.length > 0) {
        const tagsToRemoveIds = currentArticleTags
          .filter(at => tagsToRemove.includes(at.tag.name))
          .map(at => at.id);

        await transactionalEntityManager
          .createQueryBuilder()
          .delete()
          .from(ArticleTag)
          .where("id IN (:...ids)", { ids: tagsToRemoveIds })
          .execute();
      }

      // 添加新的标签
      if (tagsToAdd.length > 0) {
        for (const tagName of tagsToAdd) {
          // 查找或创建标签
          let tag = await transactionalEntityManager.findOne(Tag, { where: { name: tagName } });
          if (!tag) {
            tag = transactionalEntityManager.create(Tag, { name: tagName });
            tag = await transactionalEntityManager.save(Tag, tag);
          }

          // 创建新的文章-标签关联
          const articleTag = transactionalEntityManager.create(ArticleTag, {
            article: { id: article.id },
            tag: { id: tag.id }
          });
          await transactionalEntityManager.save(ArticleTag, articleTag);
        }
      }
    });
  }
}