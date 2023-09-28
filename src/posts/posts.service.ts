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
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import * as schedule from 'node-schedule';
import * as cron from 'node-cron';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private postModel: mongoose.Model<Post>,
    private schedulerRegistry: SchedulerRegistry,
  ) {
    cloudinary.config({
      cloud_name: process.env.CLOUD_NAME,
      api_key: process.env.API_KEY,
      api_secret: process.env.API_SECRET,
    });
    // cron.schedule('* * * * *', this.checkAndMarkPostsAsPublished.bind(this));
  }

  async createPost(file: Express.Multer.File, post: CreatePostDto, user: User) {
    const [month, day, year] = post.date.split('-');
    const [hour, minute] = post.time.split(':');

    // Create a Date object using the parsed values
    const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(
      2,
      '0',
    )}`;
    const formattedTime = `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;

    // Create a Date object using the reformatted values
    const scheduledTime = new Date(`${formattedDate}T${formattedTime}:00.000Z`);

    const result = await this.uploadFile(file);
    const data = Object.assign(
      post,
      { user: user._id },
      { Url: result.secure_url },
      {
        CloudinaryId: result.public_id,
      },
      {
        scheduledTime: scheduledTime,
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
    const posts = await this.postModel.find({ isVisible: true });
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
  @Cron(CronExpression.EVERY_SECOND)
  async checkAndMarkPostsAsPublished() {
    const now = new Date();
    console.log(`running crone at ${now}`);
    await this.postModel.updateMany(
      {
        scheduledTime: { $lte: now },
        isVisible: false,
      },
      { $set: { isVisible: true } },
    );
  }
}
