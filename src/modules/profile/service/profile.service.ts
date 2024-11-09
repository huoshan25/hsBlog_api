import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from '../entities/profile.entity';
import { UpdateProfileDto } from '../dto/profile.dto';

@Injectable()
export class ProfileService implements OnModuleInit {
  constructor(
    @InjectRepository(Profile)
    private profileRepository: Repository<Profile>,
  ) {}

  // 应用启动时初始化默认数据
  async onModuleInit() {
    const count = await this.profileRepository.count();
    if (count === 0) {
      const defaultProfile = this.profileRepository.create({
        name: '火山',
        title: 'Web前端开发',
        description: '建立广泛的知识储备，专注深耕前端技术栈，热爱技术，热爱开源，持续学习中...',
        bio: [
          '👨‍💻 目前专注于全栈开发，主要是前端领域',
          '🌱 正在学习 Rust 和 后端开发',
          '🎯 2024年目标：写 100 篇技术博客',
          '🏃‍♂️‍➡️ 业余时间喜欢健身和阅读技术书籍'
        ],
        skills: [],
        projects: [],
        contacts: [],
        seo: {}
      });
      await this.profileRepository.save(defaultProfile);
    }
  }

  async getProfile() {
    return this.profileRepository.findOne({ where: { id: 1 } });
  }

  async updateProfile(updateProfileDto: UpdateProfileDto) {
    await this.profileRepository.update(1, updateProfileDto);
    return this.getProfile();
  }
}