import { IsNotEmpty, IsString } from 'class-validator';
export class CreatePostDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  content: string;
  @IsNotEmpty()
  date: string;
  @IsNotEmpty()
  time: string;
}
