import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

// Schema for page property
@Schema({ _id: false })
export class PagePropertyDocument {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  type: string;

  @Prop({ type: MongooseSchema.Types.Mixed, required: true })
  value: any;
}

export const PagePropertySchema = SchemaFactory.createForClass(PagePropertyDocument);

// Schema for backlink
@Schema({ _id: false })
export class BacklinkDocument {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  sourcePageId: string;

  @Prop({ required: true })
  sourcePageTitle: string;

  @Prop({ required: true })
  targetPageId: string;

  @Prop({ required: true, type: Date })
  createdAt: Date;

  @Prop()
  context?: string;
}

export const BacklinkSchema = SchemaFactory.createForClass(BacklinkDocument);

// Main page schema
@Schema({
  collection: 'notion_pages',
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
})
export class NotionPageDocument extends Document {
  @Prop({ required: true, unique: true })
  id: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  databaseId: string;

  @Prop({ required: true })
  url: string;

  @Prop()
  content?: string;

  @Prop({ type: [PagePropertySchema], default: [] })
  properties: PagePropertyDocument[];

  @Prop({ type: [BacklinkSchema], default: [] })
  backlinks: BacklinkDocument[];

  @Prop({ required: true, type: Date })
  createdAt: Date;

  @Prop({ required: true, type: Date })
  updatedAt: Date;
}

export const NotionPageSchema = SchemaFactory.createForClass(NotionPageDocument);

// Create indexes for faster queries
NotionPageSchema.index({ databaseId: 1 });
NotionPageSchema.index({ 'backlinks.sourcePageId': 1 });
NotionPageSchema.index({ 'backlinks.targetPageId': 1 }); 