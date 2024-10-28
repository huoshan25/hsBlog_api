import { extname } from 'path';

/**
 * 文件验证工具类
 * 用于验证和识别上传的文件类型，图片和GIS文件
 */
export class FileValidationUtil {
  /** 允许的图片文件扩展名列表 */
  private static readonly ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.tiff', '.svg'];

  /** 允许的GIS文件扩展名列表 */
  private static readonly ALLOWED_GIS_EXTENSIONS = ['.shp', '.dbf', '.prj', '.shx', '.geojson', '.kml', '.gpx'];

  /**
   * 判断文件是否为图片
   * @param file - 上传的文件对象
   * @returns 如果文件是图片则返回true，否则返回false
   */
  static isImage(file: Express.Multer.File): boolean {
    if (!file || !file.originalname) {
      return false;
    }
    const ext = extname(file.originalname).toLowerCase();
    return this.ALLOWED_IMAGE_EXTENSIONS.includes(ext);
  }

  /**
   * 判断文件是否为GIS文件
   * @param file - 上传的文件对象
   * @returns 如果文件是GIS文件则返回true，否则返回false
   */
  static isGisFile(file: Express.Multer.File): boolean {
    if (!file || !file.originalname) {
      return false;
    }
    const ext = extname(file.originalname).toLowerCase();
    return this.ALLOWED_GIS_EXTENSIONS.includes(ext);
  }

  /**
   * 判断文件是否为图片或GIS文件
   * @param file - 上传的文件对象
   * @returns 如果文件是图片或GIS文件则返回true，否则返回false
   */
  static isImageOrGisFile(file: Express.Multer.File): boolean {
    return this.isImage(file) || this.isGisFile(file);
  }

  /**
   * 获取文件类型
   * @param file - 上传的文件对象
   * @returns 返回文件类型：'image'、'gis'或'unknown'
   */
  static getFileType(file: Express.Multer.File): 'image' | 'gis' | 'unknown' {
    if (this.isImage(file)) return 'image';
    if (this.isGisFile(file)) return 'gis';
    return 'unknown';
  }

  /**
   * 根据文件路径判断是否为图片或GIS文件
   * @param filePath - 文件路径
   * @returns 如果文件是图片或GIS文件则返回true，否则返回false
   */
  static isImageOrGisFilePath(filePath: string): boolean {
    const ext = extname(filePath).toLowerCase();
    return this.ALLOWED_IMAGE_EXTENSIONS.includes(ext) || this.ALLOWED_GIS_EXTENSIONS.includes(ext);
  }
}