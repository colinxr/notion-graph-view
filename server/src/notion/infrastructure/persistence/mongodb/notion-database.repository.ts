import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { INotionDatabaseRepository } from '../../../domain/repositories/notion-database.repository.interface';
import { NotionDatabase } from '../../../domain/models/notion-database.entity';
import { NotionDatabaseDocument } from './notion-database.schema';

@Injectable()
export class NotionDatabaseRepository implements INotionDatabaseRepository {
  constructor(
    @InjectModel(NotionDatabaseDocument.name)
    private readonly databaseModel: Model<NotionDatabaseDocument>,
  ) {}

  async findById(id: string): Promise<NotionDatabase | null> {
    const document = await this.databaseModel.findOne({ id }).exec();
    if (!document) return null;
    return this.mapToDomain(document);
  }

  async findByWorkspaceId(workspaceId: string): Promise<NotionDatabase[]> {
    const documents = await this.databaseModel.find({ workspaceId }).exec();
    return documents.map(doc => this.mapToDomain(doc));
  }

  async findByOwnerId(ownerId: string): Promise<NotionDatabase[]> {
    const documents = await this.databaseModel.find({ ownerId }).exec();
    return documents.map(doc => this.mapToDomain(doc));
  }

  async findAll(): Promise<NotionDatabase[]> {
    const documents = await this.databaseModel.find().exec();
    return documents.map(doc => this.mapToDomain(doc));
  }

  async save(database: NotionDatabase): Promise<void> {
    const persistenceData = this.mapToPersistence(database);
    await this.databaseModel.findOneAndUpdate(
      { id: database.id },
      { $set: persistenceData },
      { upsert: true, new: true },
    ).exec();
  }

  async delete(id: string): Promise<void> {
    await this.databaseModel.findOneAndDelete({ id }).exec();
  }

  // Mapper methods
  private mapToDomain(document: NotionDatabaseDocument): NotionDatabase {
    return new NotionDatabase({
      id: document.id,
      title: document.title,
      workspaceId: document.workspaceId,
      ownerId: document.ownerId,
      lastSyncedAt: document.lastSyncedAt,
      description: document.description,
      url: document.url,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    });
  }

  private mapToPersistence(entity: NotionDatabase): Partial<NotionDatabaseDocument> {
    return {
      id: entity.id,
      title: entity.title,
      workspaceId: entity.workspaceId,
      ownerId: entity.ownerId,
      lastSyncedAt: entity.lastSyncedAt,
      description: entity.description,
      url: entity.url,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
} 