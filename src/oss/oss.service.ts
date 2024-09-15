import { HttpStatus, Injectable } from '@nestjs/common';
import * as OSS from 'ali-oss';
import { Stream } from 'stream';
import ossConfig from '../config/oss.config';
import { STS } from 'ali-oss';
import { ApiResponse } from '../common/response';
import Sts20150401 from '@alicloud/sts20150401';

@Injectable()
export class OssService {
  private readonly client: OSS;
  private readonly stsClient: STS;
  private readonly bucket: string;

  constructor() {
    /**初始化 OSS 客户端*/
    this.client = new OSS({
      region: ossConfig.region,
      accessKeyId: ossConfig.accessKeyId,
      accessKeySecret: ossConfig.accessKeySecret,
      bucket: ossConfig.bucket,
      endpoint: ossConfig.endpoint,
    });

    /**初始化 STS 客户端*/
    this.stsClient = new STS({
      accessKeyId: ossConfig.accessKeyId,
      accessKeySecret: ossConfig.accessKeySecret,
    });

    this.bucket = ossConfig.bucket;
  }

  async getSignature() {

    const config = {
      // ...
      // 设置上传回调URL，即回调服务器地址，用于处理应用服务器与 OSS 之间的通信
      // OSS 会在文件上传完成后，把文件信息通过此回调URL发送给应用服务器
      callbackUrl: 'http://kunwu.tech:3000/oss/result',
    };

    // 上传回调。
    const callback = {


      // 设置回调请求的服务器地址
      callbackUrl: config.callbackUrl,
      // 设置回调的内容，${object} 等占位符会由 OSS 进行填充
      // ${object}表示文件的存储路径，${mimeType}表示资源类型，对于图片类型的文件，可以通过${imageInfo.height}等去设置宽高信息
      callbackBody:
        'filename=${object}&size=${size}&mimeType=${mimeType}&height=${imageInfo.height}&width=${imageInfo.width}',
      // 设置回调的内容类型，也支持 application/json
      callbackBodyType: 'application/x-www-form-urlencoded',
    };

    // 响应给客户端的签名和策略等信息
    return {


      // ...
      // 传给客户端的回调参数，需要通过Buffer.from 对 JSON 进行 Base64 编码
      callback: Buffer.from(JSON.stringify(callback)).toString('base64'),
    };
  }

  /**获取临时签名*/
  async getTemporarySignature(): Promise<any> {
    const date = new Date();
    date.setDate(date.getDate() + 1); // 设置签名过期时间为一天

    const policy = {
      expiration: date.toISOString(),
      conditions: [
        ['content-length-range', 0, 1048576000], // 设置上传文件的大小限制
      ],
    };

    const signature = this.client.calculatePostSignature(policy);
    return new ApiResponse(HttpStatus.OK, '获取签名成功', {
      accessKeyId: ossConfig.accessKeyId,
      policy: signature.policy,
      signature: signature.Signature,
      bucket: this.bucket,
      region: ossConfig.region,
    });
  }

  /**获取临时签名STS*/
  async getTemporarySignatureSts(): Promise<any> {
    const policy = {
      Statement: [
        {
          Effect: 'Allow',
          Action: [
            'oss:PutObject',
          ],
          Resource: [
            'acs:oss:*:*:examplebucket/*',
          ],
        },
      ],
      Version: '1',
    };

    const roleArn = `acs:ram::1363839880516693:role/ram-oss`;
    try {
      const token = await this.stsClient.assumeRole(roleArn, policy, 3600 * 24);
      return {
        accessKeyId: token.credentials.AccessKeyId,
        accessKeySecret: token.credentials.AccessKeySecret,
        securityToken: token.credentials.SecurityToken,
        bucket: this.bucket,
        region: ossConfig.region,
      };
    } catch (error) {
      // console.error('错误假设角色:', error);
      throw new Error('未能担任角色');
    }
  }

  /**
   * 上传文件
   * @param fileName
   * @param fileStream
   */
  async uploadFile(fileName: string, fileStream: Stream): Promise<OSS.PutObjectResult> {
    return await this.client.put(fileName, fileStream);
  }

  /**
   * 获取文件下载 URL
   * @param fileName
   */
  async getDownloadUrl(fileName: string): Promise<string> {
    return this.client.signatureUrl(fileName, { expires: 3600 });
  }

  /**
   * 删除文件
   * @param fileName
   */
  async deleteFile(fileName: string): Promise<OSS.DeleteResult> {
    return await this.client.delete(fileName);
  }
}
