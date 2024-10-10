import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { Category } from '../entities/category.entity';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { Article, ArticleStatus } from '../../article/entities/article.entity';
import { DeleteCategoryDto } from '../dto/delete-category.dto';
import { OssUploadService } from '../../oss/ali/service/ossUpload.service';

@Injectable()
export class CategoryService {

  constructor(
    // 注入Category仓库以与数据库交互
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,

    @InjectRepository(Article)
    private articleRepository: Repository<Article>,

    private dataSource: DataSource,

    private ossUploadService: OssUploadService,
  ) {}

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

  /**
   * 新增分类
   */
  async createCategoryWithImage(createCategoryDto: CreateCategoryDto, categoryImage: Express.Multer.File) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 检查分类名称是否已存在
      const existingCategory = await queryRunner.manager.findOne(Category, {
        where: { name: createCategoryDto.name }
      });

      if (existingCategory) {
        throw new ConflictException(`分类名称 "${createCategoryDto.name}" 已存在`);
      }

      // 1. 创建分类（不包含icon）
      const category = queryRunner.manager.create(Category, {
        ...createCategoryDto,
        icon: 'placeholder' // 临时占位符
      });
      const savedCategory = await queryRunner.manager.save(category);
      // 2. 上传图片
      const uploadResult = await this.ossUploadService.uploadFileCategory(categoryImage, String(savedCategory.id));

      // 3. 更新分类记录，添加图片URL
      //@ts-ignore
      savedCategory.icon = uploadResult.url;
      await queryRunner.manager.save(category);

      // 提交事务
      await queryRunner.commitTransaction();

      return category;
    } catch (error) {
      // 如果出错，回滚事务
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('创建分类失败: ' + error.message);
    } finally {
      // 释放查询运行器
      await queryRunner.release();
    }
  }


  /**
   * 获取所有分类
   */
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
    return [allCategory, ...categories]
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
  async update(updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    // 预加载带有更新数据的分类
    const category = await this.categoryRepository.preload({
      ...updateCategoryDto,
    });
    if (!category) {
      throw new NotFoundException(`没有找到ID为 ${updateCategoryDto.id} 的类别`);
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
      return {  message: '分类删除成功' }
    } catch (error) {
      throw new HttpException('分类删除失败', HttpStatus.NOT_FOUND);
    }
  }

  /**
   * 根据分类id查找分类信息
   * @param id
   */
  async findCategoryById(id: number) {
    // 根据ID查找分类
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new HttpException('分类不存在', HttpStatus.NOT_FOUND);
    }
    return { ...category }
  }
}