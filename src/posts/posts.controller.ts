import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { CreatePostDto } from './dto/createPost.dto';
import { AuthGuard } from '@nestjs/passport';
import { PostsService } from './posts.service';
import { UpdatePostDto } from './dto/updatePost.dto';

// import cloudinary from './utils/cloudinary.config';

@Controller('posts')
export class PostsController {
  constructor(private postService: PostsService) {}
  @Post()
  @UseGuards(AuthGuard())
  @UseInterceptors(FileInterceptor('file'))
  async createPost(
    @UploadedFile() file: Express.Multer.File,
    @Body() createPostDto: CreatePostDto,
    @Req() req,
  ) {
    return this.postService.createPost(file, createPostDto, req.user);
  }
  @Patch(':id')
  @UseGuards(AuthGuard())
  @UseInterceptors(FileInterceptor('file'))
  async updatePost(
    @UploadedFile() file: Express.Multer.File,
    @Body() updatePostDto: UpdatePostDto,
    @Param('id') id: string,
    @Req() req,
  ) {
    return this.postService.updateById(id, file, updatePostDto, req.user);
  }
  @Delete(':id')
  @UseGuards(AuthGuard())
  @UseInterceptors(FileInterceptor('file'))
  async deletePost(@Param('id') id: string, @Req() req) {
    return this.postService.deleteById(id, req.user);
  }
  @Get(':id')
  // @UseGuards(AuthGuard())
  // @UseInterceptors(FileInterceptor('file'))
  async getPost(@Param('id') id: string) {
    return this.postService.findById(id);
  }
  @Get()
  async getAllPosts() {
    return this.postService.getAllPosts();
  }
  @Post('/upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    console.log(file);
    return this.postService.uploadFile(file);
  }
}
