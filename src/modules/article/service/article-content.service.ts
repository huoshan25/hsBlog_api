import { Injectable } from '@nestjs/common';

@Injectable()
export class ArticleContentService {
  createHighlightedExcerpt(content: string, title: string, keyword: string): {
    content_highlight: string,
    title_highlight: string
  } {
    const contentExcerpt = this.createContextExcerpt(content, keyword);
    const titleHighlight = this.highlightKeyword(title, keyword);

    return {
      content_highlight: contentExcerpt,
      title_highlight: titleHighlight,
    };
  }

  private createContextExcerpt(content: string, keyword: string): string {
    const plainText = this.convertMarkdownToPlainText(content);

    const lowerKeyword = keyword.toLowerCase();
    const lowerContent = plainText.toLowerCase();
    const keywordIndex = lowerContent.indexOf(lowerKeyword);

    if (keywordIndex === -1) {
      //如果没有找到关键字，则返回内容的前150个字符
      return plainText.length > 150 ? plainText.substring(0, 150) + '...' : plainText;
    }

    const startIndex = Math.max(0, keywordIndex - 50);
    const endIndex = Math.min(plainText.length, keywordIndex + keyword.length + 100);
    let excerpt = plainText.substring(startIndex, endIndex);

    excerpt = this.highlightKeyword(excerpt, keyword);

    if (startIndex > 0) {
      excerpt = '...' + excerpt;
    }
    if (endIndex < plainText.length) {
      excerpt = excerpt + '...';
    }

    return excerpt;
  }

  private convertMarkdownToPlainText(markdown: string): string {
    return markdown
      // 移除标题
      .replace(/^#+\s+/gm, '')
      // 移除粗体和斜体
      .replace(/(\*\*|__)(.*?)\1/g, '$2')
      .replace(/(\*|_)(.*?)\1/g, '$2')
      // 移除链接,保留链接文本
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
      // 移除行内代码和代码块
      .replace(/`{1,3}[^`\n]+`{1,3}/g, '')
      // 完全移除图片,包括感叹号、alt 文本和 URL
      .replace(/!\[[^\]]*\]\([^\)]+\)/g, '')
      // 移除可能剩余的孤立感叹号
      .replace(/!\s*/g, '')
      // 移除直接的图片引用（如 image.jpg, image.png 等）
      .replace(/\b\w+\.(jpg|jpeg|png|gif|bmp|svg)\b/gi, '')
      // 移除无序列表项的符号
      .replace(/^\s*[-*+]\s/gm, '')
      // 移除有序列表项的数字
      .replace(/^\s*\d+\.\s/gm, '')
      // 移除块引用
      .replace(/^\s*>\s*/gm, '')
      // 移除水平分割线
      .replace(/^(-{3,}|_{3,}|\*{3,})$/gm, '')
      // 移除HTML标签
      .replace(/<[^>]+>/g, '')
      // 将换行符替换为空格
      .replace(/\n/g, ' ')
      // 将多个连续空格替换为单个空格
      .replace(/\s+/g, ' ')
      // 移除首尾空白字符
      .trim();
  }

  highlightKeyword(text: string, keyword: string): string {
    if (!keyword) return text;
    const regex = new RegExp(`(${this.escapeRegExp(keyword)})`, 'gi');
    return text.replace(regex, '<em>$1</em>');
  }

  private escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}