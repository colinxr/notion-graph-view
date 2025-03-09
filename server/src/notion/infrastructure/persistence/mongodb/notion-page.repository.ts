import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { INotionPageRepository } from '../../../domain/repositories/notion-page.repository.interface';
import { NotionPage } from '../../../domain/models/notion-page.entity';
import { NotionPageDocument, PagePropertyDocument, BacklinkDocument } from './notion-page.schema';
import { PageProperty } from '../../../domain/models/page-property.value-object';
import { Backlink } from '../../../domain/models/backlink.value-object';

@Injectable()
export class NotionPageRepository implements INotionPageRepository {
  constructor(
    @InjectModel(NotionPageDocument.name)
    private readonly pageModel: Model<NotionPageDocument>,
  ) {}

  async findById(id: string): Promise<NotionPage | null> {
    const document = await this.pageModel.findOne({ id }).exec();
    if (!document) return null;
    return this.mapToDomain(document);
  }

  async findByDatabaseId(databaseId: string): Promise<NotionPage[]> {
    const documents = await this.pageModel.find({ databaseId }).exec();
    return documents.map(doc => this.mapToDomain(doc));
  }

  async findWithBacklinks(pageId: string): Promise<NotionPage | null> {
    const document = await this.pageModel.findOne({ id: pageId }).exec();
    if (!document) return null;
    return this.mapToDomain(document);
  }

  async findOutgoingBacklinks(pageId: string): Promise<NotionPage[]> {
    const documents = await this.pageModel.find({ 'backlinks.sourcePageId': pageId }).exec();
    return documents.map(doc => this.mapToDomain(doc));
  }

  async findAll(): Promise<NotionPage[]> {
    const documents = await this.pageModel.find().exec();
    return documents.map(doc => this.mapToDomain(doc));
  }

  async save(page: NotionPage): Promise<void> {
    const persistenceData = this.mapToPersistence(page);
    await this.pageModel.findOneAndUpdate(
      { id: page.id },
      { $set: persistenceData },
      { upsert: true, new: true },
    ).exec();
  }

  async saveMany(pages: NotionPage[]): Promise<void> {
    const operations = pages.map(page => {
      const persistenceData = this.mapToPersistence(page);
      return {
        updateOne: {
          filter: { id: page.id },
          update: { $set: persistenceData },
          upsert: true,
        },
      };
    });

    if (operations.length > 0) {
      await this.pageModel.bulkWrite(operations);
    }
  }

  async delete(id: string): Promise<void> {
    await this.pageModel.findOneAndDelete({ id }).exec();
  }

  // Mapper methods
  private mapToDomain(document: NotionPageDocument): NotionPage {
    // Map properties
    const properties = document.properties?.map(prop => 
      new PageProperty({
        id: prop.id,
        name: prop.name,
        type: prop.type as any,
        value: prop.value,
      })
    ) || [];

    // Map backlinks
    const backlinks = document.backlinks?.map(link => 
      new Backlink({
        id: link.id,
        sourcePageId: link.sourcePageId,
        sourcePageTitle: link.sourcePageTitle,
        targetPageId: link.targetPageId,
        createdAt: link.createdAt,
        context: link.context,
      })
    ) || [];

    return new NotionPage({
      id: document.id,
      title: document.title,
      databaseId: document.databaseId,
      url: document.url,
      content: document.content,
      properties: properties,
      backlinks: backlinks,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    });
  }

  private mapToPersistence(entity: NotionPage): Partial<NotionPageDocument> {
    // Map properties
    const properties: PagePropertyDocument[] = entity.properties.map(prop => ({
      id: prop.id,
      name: prop.name,
      type: prop.type,
      value: prop.value,
    }));

    // Map backlinks
    const backlinks: BacklinkDocument[] = entity.backlinks.map(link => ({
      id: link.id,
      sourcePageId: link.sourcePageId,
      sourcePageTitle: link.sourcePageTitle,
      targetPageId: link.targetPageId,
      createdAt: link.createdAt,
      context: link.context,
    }));

    return {
      id: entity.id,
      title: entity.title,
      databaseId: entity.databaseId,
      url: entity.url,
      content: entity.content,
      properties: properties,
      backlinks: backlinks,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
} 