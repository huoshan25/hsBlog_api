import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Like, Repository } from 'typeorm';
import { Tag } from '../entities/tag.entity';
import { ArticleTag } from '../../article/entities/article-tag.entity';
import { Article, ArticleStatus } from '../../article/entities/article.entity';
import { ArticleContentService } from '../../article/service/article-content.service';

@Injectable()
export class TagService {
  private readonly logger = new Logger(TagService.name);

  constructor(
    @InjectRepository(Tag)
    private tagRepository: Repository<Tag>,
    @InjectRepository(Article)
    private articleRepository: Repository<Article>,
    @InjectRepository(ArticleTag)
    private articleTagRepository: Repository<ArticleTag>,

    private articleContentService: ArticleContentService
  ) {
  }

  /**
   * 根据标签名称获取文章列表
   * @param tagName
   * @param page
   * @param limit
   */
  async getArticlesByTagName(tagName: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const tag = await this.tagRepository.findOne({ where: { name: tagName } });

    if (!tag) {
      throw new NotFoundException(`Tag with name "${tagName}" not found`);
    }

    const [articles, total] = await this.articleRepository.createQueryBuilder('article')
      .leftJoinAndSelect('article.category_id', 'category')
      .leftJoinAndSelect('article.articleTags', 'articleTag')
      .leftJoinAndSelect('articleTag.tag', 'tag')
      .where('tag.id = :tagId', { tagId: tag.id })
      .andWhere('article.status = :status', { status: ArticleStatus.PUBLISH })
      .orderBy('article.publish_time', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const data = articles.map(({ articleTags, category_id, content, ...rest }) => ({
      ...rest,
      tags: [articleTags[0].tag],
      category_info: category_id
    }));

    return {
      data,
      total,
      page,
      limit,
    };
  }

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
        relations: ['tag'],
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
          .where('id IN (:...ids)', { ids: tagsToRemoveIds })
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
            tag: { id: tag.id },
          });
          await transactionalEntityManager.save(ArticleTag, articleTag);
        }
      }
    });
  }

  /**
   * 模糊搜索标签
   */
  async searchTags(keyword: string) {
    const tags = await this.tagRepository
      .createQueryBuilder('tag')
      .leftJoin('tag.articleTags', 'articleTags')
      .leftJoin('articleTags.article', 'article')
      .select([
        'tag.id',
        'tag.name',
        'COUNT(DISTINCT article.id) as articleCount'
      ])
      .where('LOWER(tag.name) LIKE LOWER(:keyword)', { keyword: `%${keyword}%` })
      .groupBy('tag.id')
      .orderBy('tag.name', 'ASC')
      .getRawMany();

    return tags.map(result => ({
      id: result.tag_id,
      name: this.articleContentService.highlightKeyword(result.tag_name, keyword) ,
      articleCount: parseInt(result.articleCount, 10)
    }));
  }

  /**
   * 获取标签统计数据
   */
  async getTagsStats() {
    const tags = await this.tagRepository
      .createQueryBuilder('tag')
      .leftJoin('tag.articleTags', 'articleTags')
      .leftJoin('articleTags.article', 'article')
      .select([
        'tag.id',
        'tag.name',
        'COUNT(DISTINCT article.id) as articleCount'
      ])
      .where('article.status = :status', { status: ArticleStatus.PUBLISH })
      .groupBy('tag.id')
      .orderBy('articleCount', 'DESC')
      .limit(30)
      .getRawMany();

    return tags.map(tag => ({
      name: tag.tag_name,
      value: parseInt(tag.articleCount)
    }));
  }

  /**
   * 获取标签使用趋势
   */
  async getTagsTrend() {
    // 获取过去12个月的数据
    const months = 12;
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);

    const trends = await this.articleTagRepository
      .createQueryBuilder('articleTag')
      .leftJoin('articleTag.article', 'article')
      .leftJoin('articleTag.tag', 'tag')
      .select([
        'DATE_FORMAT(article.create_time, "%Y-%m") as month', // 修改这里
        'COUNT(DISTINCT tag.id) as tagCount'
      ])
      .where('article.create_time >= :startDate', { startDate }) // 修改这里
      .andWhere('article.status = :status', { status: ArticleStatus.PUBLISH })
      .groupBy('month')
      .orderBy('month', 'ASC')
      .getRawMany();

    return {
      xAxis: trends.map(t => t.month),
      series: trends.map(t => parseInt(t.tagCount))
    };
  }

  /**
   * 获取标签关联分析
   */
  async getTagsRelation() {
    const relations = await this.articleTagRepository
      .createQueryBuilder('at1')
      .leftJoin('at1.article', 'article')
      .leftJoin('at1.tag', 'tag1')
      .leftJoin('article.articleTags', 'at2')
      .leftJoin('at2.tag', 'tag2')
      .select([
        'tag1.name as source',
        'tag2.name as target',
        'COUNT(DISTINCT article.id) as value'
      ])
      .where('article.status = :status', { status: ArticleStatus.PUBLISH })
      .andWhere('tag1.id != tag2.id')
      .groupBy('tag1.id')
      .addGroupBy('tag2.id')
      .having('value > 0')
      .orderBy('value', 'DESC')
      .limit(50)
      .getRawMany();

    return relations.map(r => ({
      source: r.source,
      target: r.target,
      value: parseInt(r.value)
    }));
  }

}