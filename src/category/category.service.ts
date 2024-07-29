import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Article, ArticleStatus } from '../article/entities/article.entity';
import { ApiResponse } from '../common/response';
import { DeleteCategoryDto } from './dto/delete-category.dto';

@Injectable()
export class CategoryService {

  // 注入Category仓库以与数据库交互
  @InjectRepository(Category)
  private categoryRepository: Repository<Category>;
  @InjectRepository(Article)
  private articleRepository: Repository<Article>;

  /**预置默认数据*/
  async seedDefaultCategories() {
    const unclassified = await this.categoryRepository.findOne({ where: { name: '未分类' } });
    if (!unclassified) {
      await this.categoryRepository.save({
        name: '未分类',
        alias: 'uncategorized',
        icon: 'https://hs-blog.oss-cn-beijing.aliyuncs.com/unassorted.svg',
        sort: 99,
        isEdit: false,
      });
    }
  }

  // 新增分类
  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const category = this.categoryRepository.create(createCategoryDto);
    return this.categoryRepository.save(category);
  }

  // 获取所有分类
  async findAll() {
    // 从数据库中查找并返回所有分类
    const categories  = await this.categoryRepository
      .createQueryBuilder('category')
      .addOrderBy('CASE WHEN category.sort = 0 THEN 0 ELSE 1 END', 'ASC') // 将sort为0的记录排在前面
      .addOrderBy('category.sort', 'ASC') // 对其他记录按sort字段升序排序
      .loadRelationCountAndMap('category.article_count', 'category.articles') // 加载并映射文章数量
      .getMany();

    // 计算所有发布状态的文章数量
    const totalPublishedArticles = await this.articleRepository.createQueryBuilder('article')
      .where('article.status = :status', { status: ArticleStatus.PUBLISH })
      .getCount();

    const allCategory = {
      id: 'all',
      name: '全部分类',
      alias: 'all',
      icon: 'https://hs-blog.oss-cn-beijing.aliyuncs.com/allCategory.svg',
      creation_time: '2024-07-28T08:05:25.778Z',
      update_time: '2024-07-28T08:05:25.778Z',
      sort: 0,
      isEdit: false,
      article_count: totalPublishedArticles // 计算所有文章数量
    };

    // 将“全部分类”和“未分类”插入到分类数组中
    const list = [allCategory, ...categories];

    return new ApiResponse(HttpStatus.OK, '操作成功', list);
  }

  // 根据ID获取单个分类
  async findOne(id: number): Promise<Category> {
    // 根据ID查找分类，并包括相关的文章
    const category = await this.categoryRepository.findOne({ where: { id }, relations: ['articles'] });
    // 如果分类未找到，则抛出NotFoundException
    if (!category) {
      throw new NotFoundException(`没有找到ID为 ${id} 的类别`);
    }
    return category;
  }

  // 根据ID更新分类
  async update(id: number, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    // 预加载带有更新数据的分类
    const category = await this.categoryRepository.preload({
      id,
      ...updateCategoryDto,
    });
    if (!category) {
      throw new NotFoundException(`没有找到ID为 ${id} 的类别`);
    }
    // 将更新后的分类保存到数据库
    return this.categoryRepository.save(category);
  }

  /**
   * 删除分类
   */
  async deleteCategory(DeleteCategoryDto: DeleteCategoryDto) {
    try {
      await this.categoryRepository.delete({ id: In(DeleteCategoryDto.ids) });
      return new ApiResponse(HttpStatus.OK, '分类删除成功');
    } catch (error) {
      return new ApiResponse(HttpStatus.INTERNAL_SERVER_ERROR, '分类删除失败');
    }
  }

  // 根据分类ID查找文章
  async findArticles(id: number) {
    // 根据ID查找文章
    const foundArticles: Article = await this.articleRepository.findOneBy({ id });
    // 如果文章未找到，则抛出HttpException
    if (!foundArticles) {
      throw new HttpException('文章不存在', HttpStatus.NOT_FOUND);
    }
    // 返回用空格替换换行符后的文章内容
    return { code: HttpStatus.OK, message: '查询成功', data: { content: foundArticles.content.replace(/\n+/g, ' ') } };
  }
}
