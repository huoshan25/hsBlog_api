import { PartialType } from '@nestjs/mapped-types';
import { CreateOssDto } from './create-oss.dto';

export class UpdateOssDto extends PartialType(CreateOssDto) {}
