import { Controller, Get, Put, Body } from '@nestjs/common';
import { ProfileService } from '../../service/profile.service';
import { UpdateProfileDto } from '../../dto/profile.dto';

@Controller('blog/profile')
export class ProfileBlogController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  getProfile() {
    return this.profileService.getProfile();
  }
}