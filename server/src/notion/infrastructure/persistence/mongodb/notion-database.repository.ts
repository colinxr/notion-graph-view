import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { INotionDatabaseRepository } from '../../../domain/repositories/notion-database.repository.interface';
import { NotionDatabase as DomainDatabase } from '../../../domain/models/notion-database.entity';
import { NotionDatabaseDocument } from './notion-database.schema';
import { NotionDatabaseDto } from '../../../application/dtos/database.dto';

/**
 * Repository for Notion database operations
 */
@Injectable()
export class NotionDatabaseRepository implements INotionDatabaseRepository {
  private readonly logger = new Logger(NotionDatabaseRepository.name);

  constructor(
    @InjectModel(NotionDatabaseDocument.name) private readonly databaseModel: Model<NotionDatabaseDocument>,
  ) {}

  /**
   * Find all databases
   */
  async findAll(): Promise<DomainDatabase[]> {
    try {
      const databases = await this.databaseModel.find().exec();
      return databases.map(db => this.toDomainModel(db));
    } catch (error) {
      this.logger.error(`Error finding all databases: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Find databases by workspace ID
   * @param workspaceId The workspace ID
   */
  async findByWorkspaceId(workspaceId: string): Promise<DomainDatabase[]> {
    try {
      const databases = await this.databaseModel.find({ workspaceId }).exec();
      return databases.map(db => this.toDomainModel(db));
    } catch (error) {
      this.logger.error(`Error finding databases by workspace ID: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Find databases by owner ID
   * @param ownerId The owner ID
   */
  async findByOwnerId(ownerId: string): Promise<DomainDatabase[]> {
    try {
      // Since we simplified our model, we need to adapt this query
      const databases = await this.databaseModel.find({ userId: ownerId }).exec();
      return databases.map(db => this.toDomainModel(db));
    } catch (error) {
      this.logger.error(`Error finding databases by owner ID: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Find a database by ID
   * @param id The database ID
   */
  async findById(id: string): Promise<DomainDatabase | null> {
    try {
      const database = await this.databaseModel.findById(id).exec();
      return database ? this.toDomainModel(database) : null;
    } catch (error) {
      this.logger.error(`Error finding database by ID: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Find a database by Notion ID
   * @param notionId The Notion ID
   */
  async findByNotionId(notionId: string): Promise<DomainDatabase | null> {
    try {
      const database = await this.databaseModel.findOne({ notionId }).exec();
      return database ? this.toDomainModel(database) : null;
    } catch (error) {
      this.logger.error(`Error finding database by Notion ID: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Save a database entity
   * @param database The database entity to save
   */
  async save(database: DomainDatabase): Promise<void> {
    try {
      // Check if it exists
      const existing = await this.databaseModel.findOne({ 
        notionId: database.id 
      }).exec();

      if (existing) {
        // Update existing
        await this.databaseModel.updateOne(
          { notionId: database.id },
          {
            title: database.title,
            description: database.description,
            url: database.url,
            lastSyncedAt: database.lastSyncedAt,
            updatedAt: new Date()
          }
        ).exec();
      } else {
        // Create new - use create instead of constructor
        await this.databaseModel.create({
          notionId: database.id,
          title: database.title,
          description: database.description,
          url: database.url,
          userId: database.ownerId,
          lastSyncedAt: database.lastSyncedAt,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    } catch (error) {
      this.logger.error(`Error saving database: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Delete a database
   * @param id The database ID
   */
  async delete(id: string): Promise<void> {
    try {
      await this.databaseModel.findByIdAndDelete(id).exec();
    } catch (error) {
      this.logger.error(`Error deleting database: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Convert a MongoDB database entity to a domain model
   * @param entity The database entity
   */
  private toDomainModel(entity: NotionDatabaseDocument): DomainDatabase {
    // Get dates from the MongoDB document or use defaults
    const now = new Date();
    const createdDate = now;
    const updatedDate = now;

    return new DomainDatabase({
      id: entity.id,
      title: entity.title,
      workspaceId: entity.ownerId?.toString() || '',
      ownerId: entity.ownerId?.toString() || '',
      lastSyncedAt: new Date(),
      description: entity.description,
      url: entity.url,
      createdAt: createdDate,
      updatedAt: updatedDate
    });
  }

  /**
   * Convert a database entity to a DTO (for API responses)
   * @param entity The database entity
   */
  private toDto(entity: NotionDatabaseDocument): NotionDatabaseDto {
    // Get dates from the MongoDB document or use defaults
    const now = new Date();
    const createdDate = now;
    const updatedDate = now;
    
    return {
      id: entity._id.toString(),
      title: entity.title,
      workspaceId: entity.ownerId?.toString() || '',
      ownerId: entity.ownerId?.toString() || '',
      lastSyncedAt: new Date(),
      description: entity.description,
      url: entity.url,
      pageCount: 0, // Since we simplified the model
      createdAt: createdDate,
      updatedAt: updatedDate,
    };
  }
} 