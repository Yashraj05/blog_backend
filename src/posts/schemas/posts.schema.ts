import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import mongoose, { Document } from 'mongoose';
import { User } from 'src/auth/schemas/user.schema';

@Schema({ timestamps: true })
export class Post extends Document {
  @Prop()
  title: string;
  @Prop()
  content: string;
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: User;
  @Prop()
  Url: string;
  @Prop()
  CloudinaryId: string;
  @Prop({ type: Date, default: null }) // Add the scheduledTime field
  scheduledTime: Date;

  @Prop({ type: Boolean, default: false }) // Add the isVisible field with default false
  isVisible: boolean;
}

export const PostSchema = SchemaFactory.createForClass(Post);
