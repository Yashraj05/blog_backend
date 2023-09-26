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
const toStream = require('buffer-to-stream');
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
    const result = await cloudinary.uploader.upload(file.path);
    const data = Object.assign(
      post,
      { user: user._id },
      { imageUrl: result.secure_url },
      {
        imageCloudinaryId: result.public_id,
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
    post: CreatePostDto,
    user: User,
  ) {
    try {
      const image = await this.postModel.findById(id);
      if (!image) {
        throw new Error(`Book with ID ${id} not found.`);
      }
      console.log(image.user.toString());
      console.log(user._id.toString());
      if (image.user.toString() !== user._id.toString()) {
        return 'not authrorized to update';
      }
      await cloudinary.uploader.destroy(image.imageCloudinaryId);

      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'blogs',
      });
      const updatedData = {
        title: post.title,
        content: post.content,
        imageUrl: result.secure_url,
        imageCloudinaryId: result.public_id,
      };

      // Update the post in the database using updateOne
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
      await cloudinary.uploader.destroy(post.imageCloudinaryId);
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
      const upload = v2.uploader.upload_stream((error, result) => {
        if (error) return reject(error);
        resolve(result);
      });
      toStream(file.buffer).pipe(upload);
    });
  }

  uploadVideo(file: Express.Multer.File): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      // Configure Cloudinary upload options for videos as needed
      const videoUploadOptions = {
        resource_type: 'video' as const,
        // Add any specific video upload options here
      };

      const upload = v2.uploader.upload_stream(
        videoUploadOptions,
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );
      toStream(file.buffer).pipe(upload);
    });
  }
}
