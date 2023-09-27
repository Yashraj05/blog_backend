import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { Post, PostSchema } from './schemas/posts.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/auth/auth.module';

import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
    // MulterModule.register({
    //   storage: diskStorage({
    //     destination: 'uploads',
    //     filename(req, file, callback) {
    //       const uniqueSuffix =
    //         Date.now() + '-' + Math.round(Math.random() * 1e9);
    //       const originalname = file.originalname.replace(/\s/g, ''); // Remove spaces from the original filename
    //       const filename = `${uniqueSuffix}-${originalname}`;
    //       callback(null, filename);
    //     },
    //   }),
    // }),
    MulterModule.register({
      storage: memoryStorage(),
    }),
  ],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
