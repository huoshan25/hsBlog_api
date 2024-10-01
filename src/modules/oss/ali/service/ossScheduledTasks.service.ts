import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Article } from 'src/modules/article/entities/article.entity';
import { OssFileManagementService } from './ossFileManagement.service';

@Injectable()
export class OssScheduledTasksService {
  private readonly logger = new Logger(OssScheduledTasksService.name);

  constructor(
    @InjectRepository(Article)
    private articleRepository: Repository<Article>,
    private ossFileManagement: OssFileManagementService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupUnusedOssDirectories() {
    this.logger.log('启动OSS清理任务');

    try {
      // 获取 OSS 上的所有文章目录
      const ossDirectories = await this.listOssDirectories();

      // 获取数据库中所有文章的 ID
      const dbArticleIds = await this.getDbArticleIds();

      // 找出需要删除的目录
      const directoriesToDelete = ossDirectories.filter(dir => !dbArticleIds.includes(dir));

      // 删除不再使用的目录
      for (const dir of directoriesToDelete) {
        await this.deleteOssDirectory(dir);
        this.logger.log(`删除OSS目录: ${dir}`);
      }

      this.logger.log(`清理完成。删除 ${directoriesToDelete.length} 目录.`);
    } catch (error) {
      this.logger.error('OSS清理过程中出现错误:', error);
    }
  }

  private async listOssDirectories(): Promise<string[]> {
    // 使用 AliService 来获取目录列表
    return this.ossFileManagement.listDirectories('article/');
  }

  private async getDbArticleIds(): Promise<string[]> {
    const articles = await this.articleRepository.find({ select: ['id'] });
    return articles.map(article => article.id.toString());
  }

  private async deleteOssDirectory(directoryName: string) {
    // 使用 AliService 来删除目录
    await this.ossFileManagement.deleteDirectory(`article/${directoryName}/`);
  }
}