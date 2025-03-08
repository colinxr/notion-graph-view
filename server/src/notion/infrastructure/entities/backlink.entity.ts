import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

/**
 * Represents a backlink (reference) between two Notion pages
 */
@Schema({
  collection: 'notion_backlinks',
  timestamps: true,
})
export class Backlink extends Document {
  @Prop({ required: true, index: true })
  sourcePageId: string;

  @Prop({ required: true })
  sourcePageTitle: string;

  @Prop({ required: true, index: true })
  targetPageId: string;

  @Prop()
  context?: string;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const BacklinkSchema = SchemaFactory.createForClass(Backlink);

// Create compound index for faster lookups
BacklinkSchema.index({ sourcePageId: 1, targetPageId: 1 }, { unique: true }); 