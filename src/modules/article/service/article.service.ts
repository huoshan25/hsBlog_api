import { BadRequestException, HttpStatus, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, DataSource, ILike, In, Repository, UpdateResult } from 'typeorm';
import { Article, ArticleStatus } from '../entities/article.entity';
import { CreateArticleDto } from '../dto/create-article.dto';
import { ApiResponse } from '../../../common/response';
import { Category } from '../../category/entities/category.entity';
import { FindArticlesDto } from '../dto/find-articles.dto';
import { DeleteArticlesDto } from '../dto/delete-article.dto';
import { EditArticlesStatus } from '../dto/edit-articles-status.dto';
import { UpdateArticleDto } from '../dto/update-article.dto';
import { OssFileManagementService } from '../../oss/ali/service/ossFileManagement.service';
import { TagService } from '../../tag/service/tag.service';
import { Tag } from '../../tag/entities/tag.entity';
import { ArticleContentService } from './article-content.service';
import { SearchArticleDto } from '../dto/search-article.dto';
import { CursorArticlesDto } from '../dto/cursor-articles.dto';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(Article)
    private articleRepository: Repository<Article>,

    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,

    @InjectRepository(Tag)
    private tagRepository: Repository<Tag>,

    private oosFileManagement: OssFileManagementService,
    private dataSource: DataSource,
    private tagService: TagService,
    private readonly logger: Logger,

    private articleContentService: ArticleContentService
  ) {}


  /**
   * 分页查询文章
   * @param findArticlesDto 查询参数
   */
  async findAll(findArticlesDto: FindArticlesDto) {
    const {
      page = 1,
      limit = 10,
      keyword,
      tagNames,
      id,
      title,
      status,
      categoryId,
    } = findArticlesDto;
    const query = this.articleRepository.createQueryBuilder('article')
      .leftJoinAndSelect('article.category_id', 'category')  // 将分类信息一起查询出来
      .leftJoinAndSelect('article.articleTags', 'articleTags')
      .leftJoinAndSelect('articleTags.tag', 'tag')  // 加入对标签的联接
      .orderBy('article.create_time', 'DESC') //时间倒叙
      .select([
        'article.id',
        'article.title',
        'article.status',
        'article.create_time',
        'article.update_time',
        'article.publish_time',
        'category.id',
        'category.name',  // 选择分类名称
        'articleTags.id',
        'tag.id',
        'tag.name',
      ]);

    if(status){
      query.andWhere('article.status = :status', { status });
    } else {
      query.andWhere('article.status IN (:...statuses)', { statuses: Object.values(ArticleStatus) });
    }

    if (id) {
      query.andWhere('article.id = :id', { id });
    }

    if (title) {
      query.andWhere('article.title LIKE :title', { title: `%${title}%` });
    }

    if (keyword) {
      const searchQuery = `%${keyword}%`;
      query.andWhere('article.title LIKE :searchQuery', { searchQuery })
        .orWhere('article.content LIKE :searchQuery', { searchQuery });
    }

    if (categoryId !== 'all' && categoryId) {
      query.andWhere('category.id = :categoryId', { categoryId });
    }

    if (tagNames && tagNames.length > 0) {
      query.andWhere('tag.name IN (:...tagNames)', { tagNames });
    }

    query.skip((page - 1) * limit);
    query.take(limit);

    return  await query.getManyAndCount();
  }

  /**
   * 新增文章
   * @param article
   */
  async createArticle(article: CreateArticleDto) {
    // 开始一个事务
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 使用queryRunner来执行所有数据库操作
      const newArticle = queryRunner.manager.create(Article, article);

      if (!article.category_id) {
        newArticle.category_id = null;
      }

      // 设置发布时间
      if (article.status === ArticleStatus.PUBLISH) {
        newArticle.publish_time = new Date();
      } else {
        newArticle.publish_time = null;
      }

      // 保存文章
      const savedArticle = await queryRunner.manager.save(Article, newArticle);

      if (article.tagNames && article.tagNames.length > 0) {
        await this.tagService.handleArticleTags(savedArticle, article.tagNames, queryRunner.manager);
      }

      // 更新OSS中的文件路径
      await this.oosFileManagement.updateArticleIdInPath(article.articleUUID, savedArticle.id.toString());

      // 如果所有操作都成功，提交事务
      await queryRunner.commitTransaction();

      return { id: savedArticle.id };
    } catch (error) {
      // 如果出现错误，回滚事务
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // 无论如何都要释放queryRunner
      await queryRunner.release();
    }
  }

  /**
   * 更新文章
   * @param updateArticle 更新的文章数据
   */
  async updateArticle(updateArticle: UpdateArticleDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { id, tagNames, ...articleData } = updateArticle;

      // 查找文章，包括其现有的标签
      const existingArticle = await this.articleRepository.findOne({
        where: { id },
        relations: ['articleTags', 'articleTags.tag']
      });

      if (!existingArticle) {
        return new ApiResponse(HttpStatus.NOT_FOUND, '文章不存在');
      }

      // 处理发布时间逻辑
      if (articleData.status === ArticleStatus.PUBLISH && !existingArticle.publish_time) {
        // 如果文章状态改为已发布，且之前没有发布时间，则设置发布时间
        existingArticle.publish_time = new Date();
      } else if (articleData.status !== ArticleStatus.PUBLISH) {
        // 如果文章状态不是已发布，则清除发布时间
        existingArticle.publish_time = null;
      }

      // 应用传入的更新数据
      Object.assign(existingArticle, articleData);

      // 保存更新后的文章基本信息
      const updatedArticle = await queryRunner.manager.save(Article, existingArticle);

      // 处理标签逻辑
      if (tagNames !== undefined) {  // 检查是否提供了标签信息
        await this.tagService.updateArticleTags(existingArticle, tagNames, queryRunner.manager);
      }

      await queryRunner.commitTransaction();

      return { id: updatedArticle.id };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 修改文章发布时间
   * @param articleId 文章ID
   * @param newPublishTime 新的发布时间
   */
  async updateArticlePublishTime(articleId: number, newPublishTime: Date | null) {
    const article = await this.articleRepository.findOne({ where: { id: articleId } });

    if (!article) {
      throw new NotFoundException(`ID为${articleId}的文章不存在`);
    }

    if(newPublishTime && article.status !== ArticleStatus.PUBLISH) {
      throw new BadRequestException('只有已发布的文章才能修改发布时间');
    }

    // 更新发布时间
    article.publish_time = newPublishTime;

    // 保存更新后的文章
    return this.articleRepository.save(article);
  }

  /**
   * 查询文章详情
   * @param id 文章id
   */
  async articleDetails(id: number) {

    const foundArticles: Article = await this.articleRepository
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.category_id', 'category')  // 将分类信息一起查询出来
      .leftJoinAndSelect('article.articleTags', 'articleTags')
      .leftJoinAndSelect('articleTags.tag', 'tag')  // 加入对标签的联接
      .where('article.id = :id', { id })
      .getOne()

    if (!foundArticles) {
      /**自定义响应*/
      return new ApiResponse(HttpStatus.NOT_FOUND, '文章不存在');
    }

    const { category_id, articleTags, ...rest } = foundArticles;

    // 提取标签信息
    const tags = articleTags.map(articleTag => ({
      id: articleTag.tag.id,
      name: articleTag.tag.name
    }));
    return new ApiResponse(HttpStatus.OK, '查询成功', {
      ...rest,
      category_id: category_id.id,
      category_name: category_id.name,
      category_icon: category_id.icon,
      tags,
      // category_article_count: totalPublishedArticles, //当前分类的状态为ArticleStatus.PUBLISH的所有文章数量
    });
  }

  /**
   * 更新文章状态
   */
  async editArticlesStatus(editArticlesStatus: EditArticlesStatus) {
    try {
      const result: UpdateResult = await this.articleRepository.update(
        { id: In(editArticlesStatus.ids) },
        { status: editArticlesStatus.status },
      );


      if (result.affected > 0) {
        return new ApiResponse(HttpStatus.OK, '文章状态更新成功');
      } else {
        return new ApiResponse(HttpStatus.NOT_FOUND, '未找到指定的文章进行更新');
      }
    } catch (error) {
      console.error(error);
      return new ApiResponse(HttpStatus.INTERNAL_SERVER_ERROR, '文章状态更新失败');
    }
  }

  async deleteArticles(deleteArticleDto: DeleteArticlesDto) {
    try {
      // 先查找文章
      const article = await this.articleRepository.findOne({
        where: { id: deleteArticleDto.id },
        relations: ['articleTags'] // 加载关联的标签
      });

      if (!article) {
        throw new NotFoundException(`文章不存在`);
      }

      // 使用remove而不是delete，这样可以触发级联删除
      return await this.articleRepository.remove(article);
    } catch (error) {
      throw new BadRequestException(`删除文章失败: ${error.message}`);
    }
  }

  async getArticleCount() {
    const count = await this.articleRepository.count();
    return new ApiResponse(HttpStatus.OK, '操作成功', { count });
  }

  /**获取文章标签*/
  async findAllTags(){
    const query = this.articleRepository.createQueryBuilder('article')
    query.andWhere('article.status = :status', { status: ArticleStatus.PUBLISH });
    const [article_list, article_total] = await query.getManyAndCount();
    const [tag_list, tag_total] = await this.tagService.getAllTags();
    return {
      tag_list,
      tag_total,
      article_total
    }
  }

  /**
   * 模糊搜索文章下拉框
   * @param searchArticleDto
   */
  async searchArticlesSelect(searchArticleDto: SearchArticleDto) {
    const { keyword } = searchArticleDto;

    return await this.articleRepository.find({
      where: [
        { title: ILike(`%${keyword}%`) },
        { content: ILike(`%${keyword}%`) },
      ],
      relations: ['category_id', 'articleTags'],
    })
  }

  /**
   * 模糊搜索文章
   * @param searchArticleDto
   */
  async searchArticles(searchArticleDto: SearchArticleDto) {
    const { keyword } = searchArticleDto;

    const articles = await this.articleRepository
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.category_id', 'category')
      .leftJoinAndSelect('article.articleTags', 'articleTags')
      .leftJoinAndSelect('articleTags.tag', 'tag')
      .where('LOWER(article.title) LIKE LOWER(:keyword)', { keyword: `%${keyword}%` })
      .orWhere('LOWER(article.content) LIKE LOWER(:keyword)', { keyword: `%${keyword}%` })
      .getMany();

    return articles.map(article => {
      const { category_id, articleTags, ...rest } = article;

      // 提取标签信息
      const tags = articleTags.map(articleTag => ({
        id: articleTag.tag.id,
        name: articleTag.tag.name
      }));

      const highlightedExcerpt = this.articleContentService.createHighlightedExcerpt(article.content, article.title, keyword);

      return {
        ...rest,
        category_id: category_id.id,
        category_name: category_id.name,
        category_alias: category_id.alias,
        tags,
        ...highlightedExcerpt,
      };
    });
  }

  /**
   * 前台文章列表查询服务
   * @param cursorDto 游标查询参数
   */
  async findPublicArticles(cursorDto: CursorArticlesDto) {
    const {
      cursor,
      limit = 10,
      categoryId,
    } = cursorDto;

    const query = this.articleRepository.createQueryBuilder('article')
      .leftJoinAndSelect('article.category_id', 'category')
      .leftJoinAndSelect('article.articleTags', 'articleTags')
      .leftJoinAndSelect('articleTags.tag', 'tag')
      .where('article.status = :status', { status: ArticleStatus.PUBLISH })
      .orderBy('article.id', 'DESC')
      .select([
        'article.id',
        'article.title',
        'article.brief_content',
        'article.create_time',
        'article.update_time',
        'article.publish_time',
        'category.id',
        'category.name',
        'tag.id',
        'tag.name',
      ]);

    // 游标查询
    if (cursor) {
      query.andWhere('article.id < :cursor', { cursor: Number(cursor) });
    }

    if (categoryId !== 'all' && categoryId) {
      query.andWhere('category.id = :categoryId', { categoryId });
    }

    query.take(limit + 1);

    const articles = await query.getMany();

    const hasMore = articles.length > limit;
    const items = articles.slice(0, limit);

    // 获取下一页的游标
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    const list = items.map(article => {
      const { category_id, ...articleData } = article;
      console.log(category_id,'category_id');
      return {
        ...articleData,
        category_id: category_id?.id,
        category_name: category_id?.name || '未分类',
        tags: [category_id]
      };
    });

    return {
      list,
      cursor: nextCursor,
      hasMore
    };
  }

}
