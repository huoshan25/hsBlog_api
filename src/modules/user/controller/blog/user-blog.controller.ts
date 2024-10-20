import {
  Controller, Get,
} from '@nestjs/common';

@Controller('blog/user')
export class UserBlogController {
  constructor() {
  }

  /**
   * 个人模块信息
   */
  @Get()
  async getUserInfo() {
    const data = {
      name: 'volcano',
      avatar: '/img/avatar.jpg',
      avatarBackgroundImage: 'https://hs-blog.oss-cn-beijing.aliyuncs.com/user/PixPin_2024-10-18_10-32-30.png',
      description: '“风很温柔 花很浪漫 你很特别 我很喜欢”',
      articlesTotal: 0,
      categoriesTotal: 0,
      tagTotal: 0,
    };
    return {
      data
    }
  }
}
