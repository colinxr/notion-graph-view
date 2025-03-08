import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

/**
 * Represents a property on a Notion page
 */
export class PageProperty {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  type: string;

  @Prop({ type: MongooseSchema.Types.Mixed })
  value: any;
}

/**
 * Represents a Notion page in the system
 */
@Schema({
  collection: 'notion_pages',
  timestamps: true,
})
export class NotionPage extends Document {
  @Prop({ required: true, unique: true })
  notionId: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true, index: true })
  databaseId: string;

  @Prop()
  url: string;

  @Prop({ type: String })
  content?: string;

  @Prop({ type: [Object], default: [] })
  properties: PageProperty[];

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Backlink' }] })
  backlinks: MongooseSchema.Types.ObjectId[];
}

export const NotionPageSchema = SchemaFactory.createForClass(NotionPage);

// Add any indexes here
NotionPageSchema.index({ databaseId: 1, title: 1 });
NotionPageSchema.index({ content: 'text' }); 