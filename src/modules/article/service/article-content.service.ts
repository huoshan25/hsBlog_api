import { Injectable } from '@nestjs/common';

@Injectable()
export class ArticleContentService {
  createContextExcerpt(content: string, keyword: string): string | undefined {
    const lowerKeyword = keyword.toLowerCase();
    const lowerContent = content.toLowerCase();
    const keywordIndex = lowerContent.indexOf(lowerKeyword);

    if (keywordIndex === -1) {
      return undefined;
    }

    const startIndex = Math.max(0, keywordIndex - 50);
    const endIndex = Math.min(content.length, keywordIndex + keyword.length + 100);
    let excerpt = content.substring(startIndex, endIndex);

    if (startIndex > 0) {
      excerpt = '...' + excerpt;
    }
    if (endIndex < content.length) {
      excerpt = excerpt + '...';
    }

    return excerpt;
  }

}