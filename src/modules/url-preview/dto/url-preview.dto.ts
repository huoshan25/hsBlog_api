import { IsUrl, IsNotEmpty } from 'class-validator';

export class UrlPreviewRequestDto {
  @IsUrl()
  @IsNotEmpty()
  url: string;
}