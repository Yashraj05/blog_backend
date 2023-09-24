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
  imageUrl: string;
  @Prop()
  imageCloudinaryId: string;
}

export const PostSchema = SchemaFactory.createForClass(Post);
