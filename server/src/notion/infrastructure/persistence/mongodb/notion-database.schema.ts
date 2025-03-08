import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({
  collection: 'notion_databases',
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
})
export class NotionDatabaseDocument extends Document {
  @Prop({ required: true, unique: true })
  id: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  workspaceId: string;

  @Prop({ required: true })
  ownerId: string;

  @Prop({ required: true, type: Date })
  lastSyncedAt: Date;

  @Prop()
  description?: string;

  @Prop()
  url?: string;

  @Prop({ required: true, type: Date })
  createdAt: Date;

  @Prop({ required: true, type: Date })
  updatedAt: Date;
}

export const NotionDatabaseSchema = SchemaFactory.createForClass(NotionDatabaseDocument);

// Create indexes for faster queries
NotionDatabaseSchema.index({ workspaceId: 1 });
NotionDatabaseSchema.index({ ownerId: 1 }); 