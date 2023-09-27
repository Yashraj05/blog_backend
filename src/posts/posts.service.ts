import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post } from './schemas/posts.schema';
import { Express } from 'express';
import mongoose from 'mongoose';
import { User } from 'src/auth/schemas/user.schema';
import {
  UploadApiErrorResponse,
  UploadApiResponse,
  v2 as cloudinary,
  v2,
} from 'cloudinary';
import { CreatePostDto } from './dto/createPost.dto';
import { UpdatePostDto } from './dto/updatePost.dto';
@Injectable()
export class PostsService {
  constructor(@InjectModel(Post.name) private postModel: mongoose.Model<Post>) {
    cloudinary.config({
      cloud_name: process.env.CLOUD_NAME,
      api_key: process.env.API_KEY,
      api_secret: process.env.API_SECRET,
    });
  }

  async createPost(file: Express.Multer.File, post: CreatePostDto, user: User) {
    console.log(file);
    const result = await this.uploadFile(file);
    const data = Object.assign(
      post,
      { user: user._id },
      { Url: result.secure_url },
      {
        CloudinaryId: result.public_id,
      },
    );
    const newPost = await this.postModel.create(data);
    user.posts.push(newPost);
    await user.save();
    return newPost;
  }
  async findById(id: string) {
    return await this.postModel.findById(id);
  }
  async updateById(
    id: string,
    file: Express.Multer.File,
    post: UpdatePostDto,
    user: User,
  ) {
    try {
      const blog = await this.postModel.findById(id);
      if (!post) {
        throw new Error(`Book with ID ${id} not found.`);
      }
      console.log(blog.user.toString());
      console.log(user._id.toString());
      if (blog.user.toString() !== user._id.toString()) {
        return 'not authrorized to update';
      }
      const updatedData: any = {};

      if (post.title) {
        updatedData.title = post.title;
      }

      if (post.content) {
        updatedData.content = post.content;
      }

      if (file) {
        await cloudinary.uploader.destroy(blog.CloudinaryId);
        const uploadResult = await this.uploadFile(file);
        updatedData.imageUrl = uploadResult.secure_url;
        updatedData.imageCloudinaryId = uploadResult.public_id;
      }
      return await this.postModel.updateOne({ _id: id }, updatedData);
    } catch (error) {
      console.error(`Error updating book: ${error.message}`);
      return null;
    }
  }
  async deleteById(id: string, user: User) {
    try {
      console.log('insdie');
      const image = await this.postModel.findById(id);
      console.log(image.user.toString());
      console.log(user._id.toString());
      if (image.user.toString() !== user._id.toString()) {
        return 'not authrorized to delete';
      }
      user.posts = user.posts.filter((postId) => postId.toString() !== id);
      await user.save();
      const post = await this.postModel.findByIdAndDelete(id);
      await cloudinary.uploader.destroy(post.CloudinaryId);
      return post;
    } catch (error) {
      return 'error in deleting the post';
    }
  }
  async getAllPosts() {
    const posts = await this.postModel.find();
    return posts;
  }
  async uploadFile(
    file: Express.Multer.File,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    if (file.mimetype.startsWith('image/')) {
      // Handle image upload
      return this.uploadImage(file);
    } else if (file.mimetype.startsWith('video/')) {
      // Handle video upload
      return this.uploadVideo(file);
    } else {
      throw new Error('Unsupported file type');
    }
  }

  uploadImage(file: Express.Multer.File): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      v2.uploader
        .upload_stream((error, result) => {
          if (error) return reject(error);
          resolve(result);
        })
        .end(file.buffer);
    });
  }
  async uploadVideo(file: Express.Multer.File): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      v2.uploader
        .upload_stream(
          {
            resource_type: 'video',
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          },
        )
        .end(file.buffer);
    });
  }
}
