import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Not, Repository } from 'typeorm';
import { Category } from '../entities/category.entity';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { Article, ArticleStatus } from '../../article/entities/article.entity';
import { DeleteCategoryDto } from '../dto/delete-category.dto';
import { OssUploadService } from '../../oss/ali/service/ossUpload.service';
import { OssFileManagementService } from '../../oss/ali/service/ossFileManagement.service';

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

    private ossFileManagementService: OssFileManagementService,
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
  async updateCategoryWithImage(
    updateCategoryDto: UpdateCategoryDto,
    categoryImage?: Express.Multer.File
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 检查分类是否存在
      const existingCategory = await queryRunner.manager.findOne(Category, {
        where: { id: updateCategoryDto.id }
      });

      if (!existingCategory) {
        throw new NotFoundException(`ID为 "${updateCategoryDto.id}" 的分类不存在`);
      }

      // 检查新名称是否与其他分类重复（排除当前分类）
      const duplicateCategory = await queryRunner.manager.findOne(Category, {
        where: {
          name: updateCategoryDto.name,
          id: Not(updateCategoryDto.id)
        }
      });

      if (duplicateCategory) {
        throw new ConflictException(`分类名称 "${updateCategoryDto.name}" 已存在`);
      }

      // 更新基本信息，确保不修改 id
      const { id, ...updateData } = updateCategoryDto;
      Object.assign(existingCategory, updateData);

      // 如果上传了新图片
      if (categoryImage) {
        // 删除旧图片
        if (existingCategory.icon) {
          await this.ossFileManagementService.deleteFile(existingCategory.icon)
        }

        // 上传新图片
        const uploadResult = await this.ossUploadService.uploadFileCategory(
          categoryImage,
          String(id)
        );
        //@ts-ignore
        existingCategory.icon = uploadResult.url;
      }

      // 使用 update 而不是 save
      await queryRunner.manager.update(
        Category,
        { id },
        existingCategory
      );

      // 提交事务
      await queryRunner.commitTransaction();

      return existingCategory;
    } catch (error) {
      // 回滚事务
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('更新分类失败: ' + error.message);
    } finally {
      // 释放查询运行器
      await queryRunner.release();
    }
  }

  /**
   * 删除分类
   */
  async deleteCategory(DeleteCategoryDto: DeleteCategoryDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 先查询要删除的分类信息
      const categoriesToDelete = await this.categoryRepository.find({
        where: { id: In(DeleteCategoryDto.ids) }
      });

      // 删除相关的图片
      for (const category of categoriesToDelete) {
        if (category.icon) {
          await this.ossFileManagementService.deleteFile(category.icon);
        }
      }

      // 删除分类记录
      await this.categoryRepository.delete({ id: In(DeleteCategoryDto.ids) });

      await queryRunner.commitTransaction();
      return { message: '分类删除成功' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new HttpException(
        '分类删除失败: ' + error.message,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    } finally {
      await queryRunner.release();
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
