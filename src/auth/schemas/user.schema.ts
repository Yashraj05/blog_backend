import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Post } from 'src/posts/schemas/posts.schema';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop()
  name: string;
  @Prop({ unique: [true, 'duplicate email entered'] })
  email: string;
  @Prop()
  password: string;
  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }] })
  posts: Post[];
}

export const UserSchema = SchemaFactory.createForClass(User);
