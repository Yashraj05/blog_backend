import { Exclude, Expose } from 'class-transformer';
import { Post } from 'src/posts/schemas/posts.schema';

export class UserDto {
  @Expose()
  name: string;
  @Expose({ name: 'email', toPlainOnly: true })
  email: string;

  @Exclude()
  password: string;

  @Exclude()
  posts: Post[];
}
