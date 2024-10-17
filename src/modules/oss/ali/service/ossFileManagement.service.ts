import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as OSS from 'ali-oss';
import { OssConfigService } from './ossConfig.service';

@Injectable()
export class OssFileManagementService {
  private ossClient: OSS;

  constructor(private ossConfigService: OssConfigService) {
    this.ossClient = this.ossConfigService.createOssClient();
  }

  /**
   * 更新oss上的文章uuid为文章真实id
   * @param articleUUID 文章uuid
   * @param articleId 文章id
   */
  async updateArticleIdInPath(articleUUID: string, articleId: string) {
    const listResult = await this.ossClient.list({
      prefix: `article/${articleUUID}/`,
      'max-keys': 1000
    }, {});

    for (const object of listResult.objects) {
      const newObjectName = object.name.replace(`/${articleUUID}/`, `/${articleId}/`);
      await this.ossClient.copy(newObjectName, object.name);
      await this.ossClient.delete(object.name);
    }
  }

  /**
   * 列出指定前缀下的所有目录
   * @param prefix 目录前缀
   */
  async listDirectories(prefix: string): Promise<string[]> {
    const result = await this.ossClient.list({
      prefix,
      delimiter: '/',
      'max-keys': 1000
    }, {});

    return result.prefixes.map(prefixPath => {
      /*移除前缀和尾部的斜杠，只返回目录名*/
      return prefixPath.slice(prefix.length, -1);
    });
  }

  /**
   * 删除指定目录及其所有内容
   * @param directoryPath 要删除的目录路径
   */
  async deleteDirectory(directoryPath: string) {
    let isTruncated = true;
    let nextMarker = null;

    while (isTruncated) {
      const result = await this.ossClient.list({
        prefix: directoryPath,
        'max-keys': 1000,
        marker: nextMarker,
      }, {});

      for (const object of result.objects) {
        await this.ossClient.delete(object.name);
      }

      isTruncated = result.isTruncated;
      nextMarker = result.nextMarker;
    }
  }

  /**
   * 删除指定的单个文件
   * @param objectKey 要删除的文件的完整路径（不包括bucket名称）
   */
  async deleteFile(objectKey: string) {
    try {
      return await this.ossClient.delete(objectKey);
    } catch (error) {
      throw new HttpException('删除文件失败', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}