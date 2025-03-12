import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { IGraphRepository } from '../../domain/repositories/graph.repository.interface';
import { Graph } from '../../domain/models/graph.entity';
import { GraphSharedEvent } from '../../domain/events/graph-shared.event';
import { 
  ShareGraphDto, 
  SetPublicVisibilityDto, 
  GraphResponseDto,
  GraphSettingsDto
} from '../dtos/graph.dto';
import { NodeResponseDto } from '../dtos/node.dto';
import { EdgeResponseDto } from '../dtos/edge.dto';

// This would be defined in your IAM module
interface IUserService {
  findById(id: string): Promise<any>;
  findByIds(ids: string[]): Promise<any[]>;
}

// Event publisher interface
interface IEventPublisher {
  publish(event: any): void;
}

@Injectable()
export class GraphSharingService {
  constructor(
    @Inject('IGraphRepository')
    private readonly graphRepository: IGraphRepository,
    
    @Inject('IUserService')
    private readonly userService: IUserService,
    
    @Inject('IEventPublisher')
    private readonly eventPublisher: IEventPublisher,
  ) {}

  /**
   * Share a graph with specific users
   */
  async shareWithUsers(userId: string, graphId: string, shareDto: ShareGraphDto): Promise<GraphResponseDto> {
    // Get the graph
    const graph = await this.getGraphWithOwnerCheck(userId, graphId);
    
    // Validate that users exist
    const validUsers = await this.userService.findByIds(shareDto.userIds);
    const validUserIds = validUsers.map(user => user.id);
    
    // Share with each valid user
    for (const userToShareWith of validUserIds) {
      // Skip if user is already shared with or is the owner
      if (graph.ownerId === userToShareWith || graph.sharedWith.includes(userToShareWith)) {
        continue;
      }
      
      // Share with user
      graph.shareWithUser(userToShareWith);
      
      // Publish event for each user
      this.eventPublisher.publish(
        new GraphSharedEvent(
          graph,
          userId,
          userToShareWith,
          false
        )
      );
    }
    
    // Save the updated graph
    const updatedGraph = await this.graphRepository.save(graph);
    
    // Return the updated graph
    return this.mapToGraphResponseDto(updatedGraph);
  }

  /**
   * Remove sharing for specific users
   */
  async removeSharing(userId: string, graphId: string, userIds: string[]): Promise<GraphResponseDto> {
    // Get the graph
    const graph = await this.getGraphWithOwnerCheck(userId, graphId);
    
    // Remove sharing for each user
    for (const userToRemove of userIds) {
      graph.unshareFromUser(userToRemove);
    }
    
    // Save the updated graph
    const updatedGraph = await this.graphRepository.save(graph);
    
    // Return the updated graph
    return this.mapToGraphResponseDto(updatedGraph);
  }

  /**
   * Make a graph public or private
   */
  async setPublicVisibility(
    userId: string, 
    graphId: string, 
    visibilityDto: SetPublicVisibilityDto
  ): Promise<GraphResponseDto> {
    // Get the graph
    const graph = await this.getGraphWithOwnerCheck(userId, graphId);
    
    // Update visibility
    graph.setPublicVisibility(visibilityDto.isPublic);
    
    // Publish event if making public
    if (visibilityDto.isPublic) {
      this.eventPublisher.publish(
        new GraphSharedEvent(
          graph,
          userId,
          undefined,
          true
        )
      );
    }
    
    // Save the updated graph
    const updatedGraph = await this.graphRepository.save(graph);
    
    // Return the updated graph
    return this.mapToGraphResponseDto(updatedGraph);
  }

  /**
   * Get a list of users a graph is shared with
   */
  async getSharedUsers(userId: string, graphId: string): Promise<any[]> {
    // Get the graph
    const graph = await this.getGraphWithAccessCheck(userId, graphId);
    
    // Return empty array if not shared with anyone
    if (!graph.sharedWith.length) {
      return [];
    }
    
    // Get user details for all shared users
    return this.userService.findByIds(graph.sharedWith);
  }

  /**
   * Get a graph entity with owner check (only the owner can share)
   */
  private async getGraphWithOwnerCheck(userId: string, graphId: string): Promise<Graph> {
    const graph = await this.graphRepository.findById(graphId);
    
    if (!graph) {
      throw new NotFoundException(`Graph with ID ${graphId} not found`);
    }

    // Check if user is the owner
    if (graph.ownerId !== userId) {
      throw new ForbiddenException('Only the owner can share this graph');
    }
    
    return graph;
  }

  /**
   * Get a graph entity with access check (owner or shared user)
   */
  private async getGraphWithAccessCheck(userId: string, graphId: string): Promise<Graph> {
    const graph = await this.graphRepository.findById(graphId);
    
    if (!graph) {
      throw new NotFoundException(`Graph with ID ${graphId} not found`);
    }

    // Check if user has access
    const hasAccess = graph.ownerId === userId || 
                      graph.sharedWith.includes(userId) || 
                      graph.isPublic;
                      
    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this graph');
    }
    
    return graph;
  }

  /**
   * Map a Graph entity to a GraphResponseDto
   */
  private mapToGraphResponseDto(graph: Graph): GraphResponseDto {
    const graphData = graph.toJSON();
    
    return {
      id: graphData.id!,
      name: graphData.name!,
      ownerId: graphData.ownerId!,
      description: graphData.description || '',
      workspaceId: graphData.workspaceId || undefined,
      sourceDatabaseId: graphData.sourceDatabaseId || undefined,
      createdAt: graphData.createdAt || new Date(),
      updatedAt: graphData.updatedAt || new Date(),
      isPublic: graphData.isPublic || false,
      sharedWith: graphData.sharedWith || [],
      tags: graphData.tags || [],
      nodes: (graphData.nodes || []) as NodeResponseDto[],
      edges: (graphData.edges || []) as EdgeResponseDto[],
      settings: graphData.settings as GraphSettingsDto,
    };
  }
} 