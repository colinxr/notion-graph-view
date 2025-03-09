import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IGraphRepository } from '../../../domain/repositories/graph.repository.interface';
import { Graph, GraphData } from '../../../domain/models/graph.entity';
import { GraphDocument } from './graph.schema';
import { GraphMapper } from './graph.mapper';

@Injectable()
export class MongoGraphRepository implements IGraphRepository {
  constructor(
    @InjectModel(GraphDocument.name)
    private readonly graphModel: Model<GraphDocument>,
    private readonly mapper: GraphMapper,
  ) {}

  async findById(id: string): Promise<Graph | null> {
    const graphDoc = await this.graphModel.findOne({ id }).exec();
    return graphDoc ? this.mapper.toDomain(graphDoc) : null;
  }

  async findByOwner(ownerId: string): Promise<Graph[]> {
    const graphDocs = await this.graphModel.find({ ownerId }).exec();
    return graphDocs.map(doc => this.mapper.toDomain(doc));
  }

  async findAccessibleByUser(userId: string): Promise<Graph[]> {
    const graphDocs = await this.graphModel.find({
      $or: [
        { ownerId: userId },
        { sharedWith: userId },
        { isPublic: true },
      ],
    }).exec();
    return graphDocs.map(doc => this.mapper.toDomain(doc));
  }

  async findBySourceDatabase(databaseId: string): Promise<Graph[]> {
    const graphDocs = await this.graphModel.find({ sourceDatabaseId: databaseId }).exec();
    return graphDocs.map(doc => this.mapper.toDomain(doc));
  }

  async findPublicGraphs(limit?: number, offset?: number): Promise<Graph[]> {
    let query = this.graphModel.find({ isPublic: true });
    
    if (offset !== undefined) {
      query = query.skip(offset);
    }
    
    if (limit !== undefined) {
      query = query.limit(limit);
    }
    
    const graphDocs = await query.exec();
    return graphDocs.map(doc => this.mapper.toDomain(doc));
  }

  async findByTags(tags: string[], matchAll = false): Promise<Graph[]> {
    let query;
    
    if (matchAll) {
      // All tags must match (AND)
      query = this.graphModel.find({ tags: { $all: tags } });
    } else {
      // Any tag must match (OR)
      query = this.graphModel.find({ tags: { $in: tags } });
    }
    
    const graphDocs = await query.exec();
    return graphDocs.map(doc => this.mapper.toDomain(doc));
  }

  async search(query: string, ownerId?: string): Promise<Graph[]> {
    const searchFilter: any = {
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { tags: { $regex: query, $options: 'i' } },
      ],
    };
    
    if (ownerId) {
      searchFilter.ownerId = ownerId;
    }
    
    const graphDocs = await this.graphModel.find(searchFilter).exec();
    return graphDocs.map(doc => this.mapper.toDomain(doc));
  }

  async save(graph: Graph): Promise<Graph> {
    const graphData = graph.toJSON();
    
    // Use findOneAndUpdate with upsert to handle both create and update
    const updatedDoc = await this.graphModel.findOneAndUpdate(
      { id: graphData.id },
      { $set: graphData },
      { upsert: true, new: true },
    ).exec();
    
    return this.mapper.toDomain(updatedDoc);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.graphModel.deleteOne({ id }).exec();
    return result.deletedCount > 0;
  }

  async countByOwner(ownerId: string): Promise<number> {
    return this.graphModel.countDocuments({ ownerId }).exec();
  }
} 