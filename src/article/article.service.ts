import { HttpException, HttpStatus, Injectable, Logger, NotFoundException, Post } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, UpdateResult } from 'typeorm';
import { Article, ArticleStatus } from './entities/article.entity';
import { CreateArticleDto } from './dto/create-article.dto';
import { ApiResponse } from '../common/response';
import { Category } from '../category/entities/category.entity';
import { ErrorInterceptor } from '../common/error.interceptor';
import { FindArticlesDto } from './dto/find-articles.dto';
import { Tag } from './entities/tag.entity';
import { DeleteArticlesDto } from './dto/delete-article.dto';
import { EditArticlesStatus } from './dto/edit-articles-status.dto';
import { UpdateArticleDto } from './dto/update-article.dto';

@Injectable()
export class ArticleService {

  @InjectRepository(Article)
  private articleRepository: Repository<Article>;
  private logger = new Logger();

  @InjectRepository(Tag)
  private tagRepository: Repository<Tag>;

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
      .leftJoinAndSelect('article.tags', 'tags')  // 加入对标签的联接
      .orderBy('article.create_time', 'DESC') //时间倒叙
      .select([
        'article.id',
        'article.title',
        'article.status',
        'article.create_time',
        'article.update_time',
        'category.id',
        'category.name',  // 选择分类名称
        'tags.id',
        'tags.name',
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
      query.andWhere('article.title = :title', { id });
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
      tagNames.forEach(tagName => {
        query.andWhere('tags.name LIKE :tagName', { tagName: `%${tagName}%` });
      });
    }

    query.skip((page - 1) * limit);
    query.take(limit);

    const [articles, total] = await query.getManyAndCount();

    // 处理数据，将 category 信息解构到文章字段中
    const list = articles.map(article => {
      const { category_id, tags, ...articleData } = article;
      return {
        ...articleData,
        category_id: category_id ? category_id.id : null,
        category_name: category_id ? category_id.name : '未分类',
        tags: tags.map(tag => tag.name),  // 提取标签名称
      };
    });

    return new ApiResponse(HttpStatus.OK, '操作成功', { list, total });
  }

  /**
   * 新增文章
   * @param article
   */
  async createArticle(article: CreateArticleDto) {
    try {
      const newArticle = this.articleRepository.create(article);
      if (article.tagNames && article.tagNames.length > 0) {
        const tags = await Promise.all(
          article.tagNames.map(async name => {
            let tag = await this.tagRepository.findOne({ where: { name } });
            if (!tag) {
              tag = this.tagRepository.create({ name });
              await this.tagRepository.save(tag);
            }
            return tag;
          }),
        );
        newArticle.tags = tags; // 将标签 ID 拼接成字符串
      }
      if (!article.category_id) {
        newArticle.category_id = null;
      }

      await this.articleRepository.save(newArticle);
      return new ApiResponse(HttpStatus.OK, '文章创建成功');
    } catch (error) {
      this.logger.error(error, ArticleService);
      return new ApiResponse(HttpStatus.INTERNAL_SERVER_ERROR, '文章创建失败');
    }
  }

  /**
   * 更新文章
   * @param updateArticle 更新的文章数据
   */
  async updateArticle(updateArticle: UpdateArticleDto) {
    try {
      const {id , ...article} = updateArticle
      // 首先查找文章
      const existingArticle = await this.articleRepository.findOneBy({ id });

      if (!existingArticle) {
        return new ApiResponse(HttpStatus.NOT_FOUND, '文章不存在');
      }

      // 应用传入的更新数据
      Object.assign(existingArticle, article);

      // 如果有标签更新，处理标签逻辑
      if (article.tagNames && article.tagNames.length > 0) {
        const tags = await Promise.all(
          article.tagNames.map(async name => {
            let tag = await this.tagRepository.findOne({ where: { name } });
            if (!tag) {
              tag = this.tagRepository.create({ name });
              await this.tagRepository.save(tag);
            }
            return tag;
          }),
        );
        existingArticle.tags = tags;
      }

      // 保存更新后的文章
      await this.articleRepository.save(existingArticle);

      return new ApiResponse(HttpStatus.OK, '文章更新成功');
    } catch (error) {
      this.logger.error(error, ArticleService);
      return new ApiResponse(HttpStatus.INTERNAL_SERVER_ERROR, '文章更新失败');
    }
  }

  /**
   * 查询文章详情
   * @param id
   */
  async articleDetails(id: number) {

    const foundArticles: Article = await this.articleRepository
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.category_id', 'category')  // 将分类信息一起查询出来
      .where('article.id = :id', { id })
      .getOne()

    if (!foundArticles) {
      /**自定义响应*/
      return new ApiResponse(HttpStatus.NOT_FOUND, '文章不存在');
    }

    const { category_id, ...rest } = foundArticles;
    return new ApiResponse(HttpStatus.OK, '查询成功', {
      ...rest,
      category_id: category_id.id,
      category_name: category_id.name,
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

  /**
   * 删除文章
   */
  async deleteArticles(deleteArticleDto: DeleteArticlesDto) {
    try {
      await this.articleRepository.delete(deleteArticleDto.id);
      return new ApiResponse(HttpStatus.OK, '文章删除成功');
    } catch (error) {
      console.error(error);
      return new ApiResponse(HttpStatus.INTERNAL_SERVER_ERROR, '文章删除失败');
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
    const [articleList, articleTotal] = await query.getManyAndCount();
    const [list, tagTotal] = await this.tagRepository.findAndCount();
    return new ApiResponse(HttpStatus.OK, '操作成功', { list, tagTotal, articleTotal });
  }

}
