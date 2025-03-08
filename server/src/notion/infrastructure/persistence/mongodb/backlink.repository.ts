import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Backlink } from '../../entities/backlink.entity';
import { BacklinkDto } from '../../../application/dtos/backlink.dto';

/**
 * Repository responsible for backlink persistence operations in MongoDB
 */
@Injectable()
export class BacklinkRepository {
  private readonly logger = new Logger(BacklinkRepository.name);
  
  constructor(
    @InjectModel(Backlink.name) private readonly backlinkModel: Model<Backlink>,
  ) {}

  /**
   * Create a new backlink
   * @param dto The backlink data to create
   */
  async create(dto: Omit<BacklinkDto, 'id'>): Promise<BacklinkDto> {
    try {
      const backlink = new this.backlinkModel({
        sourcePageId: dto.sourcePageId,
        sourcePageTitle: dto.sourcePageTitle,
        targetPageId: dto.targetPageId,
        context: dto.context,
        createdAt: dto.createdAt || new Date(),
      });
      
      const savedBacklink = await backlink.save();
      
      return this.toDto(savedBacklink);
    } catch (error) {
      this.logger.error(`Error creating backlink: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Find backlinks by target page ID
   * @param targetPageId The ID of the target page
   */
  async findByTargetPageId(targetPageId: string): Promise<BacklinkDto[]> {
    try {
      const backlinks = await this.backlinkModel.find({ targetPageId }).exec();
      return backlinks.map(backlink => this.toDto(backlink));
    } catch (error) {
      this.logger.error(`Error finding backlinks by target page ID: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Find backlinks by source page ID
   * @param sourcePageId The ID of the source page
   */
  async findBySourcePageId(sourcePageId: string): Promise<BacklinkDto[]> {
    try {
      const backlinks = await this.backlinkModel.find({ sourcePageId }).exec();
      return backlinks.map(backlink => this.toDto(backlink));
    } catch (error) {
      this.logger.error(`Error finding backlinks by source page ID: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Delete backlinks by source page ID
   * @param sourcePageId The ID of the source page
   */
  async deleteBySourcePageId(sourcePageId: string): Promise<void> {
    try {
      await this.backlinkModel.deleteMany({ sourcePageId }).exec();
    } catch (error) {
      this.logger.error(`Error deleting backlinks by source page ID: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Convert a Backlink entity to a BacklinkDto
   */
  private toDto(entity: Backlink): BacklinkDto {
    return {
      id: entity._id.toString(),
      sourcePageId: entity.sourcePageId,
      sourcePageTitle: entity.sourcePageTitle,
      targetPageId: entity.targetPageId,
      context: entity.context,
      createdAt: entity.createdAt,
    };
  }
} 