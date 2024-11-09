import { Controller, Get, Put, Body } from '@nestjs/common';
import { ProfileService } from '../../service/profile.service';
import { UpdateProfileDto } from '../../dto/profile.dto';

@Controller('admin/profile')
export class ProfileAdminController {
  constructor(private readonly profileService: ProfileService) {
  }

  @Get()
  async getProfile() {
    const profile = await this.profileService.getProfile();
    return { data: profile };
  }

  @Put()
  updateProfile(@Body() updateProfileDto: UpdateProfileDto) {
    return this.profileService.updateProfile(updateProfileDto);
  }
}