import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

/**
 * Represents a Notion database in the system
 */
@Schema({
  collection: 'notion_databases',
  timestamps: true,
})
export class NotionDatabase extends Document {
  @Prop({ required: true, unique: true })
  notionId: string;

  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop()
  url?: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, index: true })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'NotionPage' }] })
  pages: MongooseSchema.Types.ObjectId[];
}

export const NotionDatabaseSchema = SchemaFactory.createForClass(NotionDatabase);

// Add indexes
NotionDatabaseSchema.index({ userId: 1, title: 1 }); 