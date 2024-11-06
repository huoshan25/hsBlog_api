import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateArticleTtsDto {
  @IsNotEmpty({ message: "文章id必填" })
  readonly id: number;

  @IsOptional()
  readonly short_content?: string;

  @IsOptional()
  readonly short_audio_url?: string;

  @IsOptional()
  readonly long_content?: string;

  @IsOptional()
  readonly long_audio_url?: string;
}