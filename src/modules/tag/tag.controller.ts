import { Controller } from '@nestjs/common';
import { TagService } from './service/tag.service';

@Controller('tag')
export class TagController {
  constructor(private readonly tagService: TagService) {}

}
