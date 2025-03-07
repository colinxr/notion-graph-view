import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<UserModel>;

@Schema({
  collection: 'users',
  timestamps: true, // Automatically add createdAt and updatedAt
  toJSON: {
    virtuals: true,
    getters: true,
  },
})
export class UserModel extends Document {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  name: string;

  @Prop({ type: Object, required: false })
  notionCredentials?: {
    accessToken: string;
    workspaceId: string;
  };

  @Prop({ type: Object, required: false })
  authToken?: {
    token: string;
    expiresAt: Date;
  };

  // Add explicit timestamp fields
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(UserModel); 