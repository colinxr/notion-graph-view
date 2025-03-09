import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { IGraphRepository } from '../../domain/repositories/graph.repository.interface';
import { Graph } from '../../domain/models/graph.entity';
import { Node } from '../../domain/models/node.entity';
import { Edge, EdgeType } from '../../domain/models/edge.entity';
import { GraphSettings, GraphSettingsData, LayoutAlgorithm } from '../../domain/models/graph-settings.value-object';
import { 
  CreateGraphDto, 
  UpdateGraphDto, 
  GraphResponseDto, 
  GraphSummaryResponseDto,
  GraphSettingsDto
} from '../dtos/graph.dto';
import { CreateNodeDto, UpdateNodeDto, NodeResponseDto } from '../dtos/node.dto';
import { CreateEdgeDto, UpdateEdgeDto, EdgeResponseDto } from '../dtos/edge.dto';

@Injectable()
export class GraphService {
  constructor(
    @Inject('IGraphRepository')
    private readonly graphRepository: IGraphRepository,
  ) {}

  /**
   * Create a new graph
   */
  async createGraph(ownerId: string, createGraphDto: CreateGraphDto): Promise<GraphResponseDto> {
    // Create the graph entity with default settings if not provided
    const graphData = {
      ...createGraphDto,
      ownerId,
      settings: createGraphDto.settings || this.getDefaultGraphSettings(),
    };

    // Create the graph without nodes and edges first
    const { nodes: nodeData, edges: edgeData, ...graphWithoutNodesAndEdges } = graphData;
    const graph = new Graph(graphWithoutNodesAndEdges);

    // Add nodes if provided
    if (nodeData && nodeData.length > 0) {
      nodeData.forEach(node => {
        graph.addNode(node);
      });
    }

    // Add edges if provided
    if (edgeData && edgeData.length > 0) {
      edgeData.forEach(edge => {
        graph.addEdge(edge);
      });
    }

    // Save the graph
    const savedGraph = await this.graphRepository.save(graph);
    
    // Map the graph to a DTO and return
    return this.mapToGraphResponseDto(savedGraph);
  }

  /**
   * Get a graph by ID
   */
  async getGraphById(userId: string, graphId: string): Promise<GraphResponseDto> {
    const graph = await this.graphRepository.findById(graphId);
    
    if (!graph) {
      throw new NotFoundException(`Graph with ID ${graphId} not found`);
    }

    // Check if user has access to the graph
    this.validateGraphAccess(userId, graph);
    
    return this.mapToGraphResponseDto(graph);
  }

  /**
   * Get all graphs accessible to a user
   */
  async getAccessibleGraphs(userId: string): Promise<GraphSummaryResponseDto[]> {
    const graphs = await this.graphRepository.findAccessibleByUser(userId);
    return graphs.map(graph => this.mapToGraphSummaryResponseDto(graph));
  }

  /**
   * Get graphs owned by a user
   */
  async getOwnedGraphs(userId: string): Promise<GraphSummaryResponseDto[]> {
    const graphs = await this.graphRepository.findByOwner(userId);
    return graphs.map(graph => this.mapToGraphSummaryResponseDto(graph));
  }

  /**
   * Get public graphs
   */
  async getPublicGraphs(limit?: number, offset?: number): Promise<GraphSummaryResponseDto[]> {
    const graphs = await this.graphRepository.findPublicGraphs(limit, offset);
    return graphs.map(graph => this.mapToGraphSummaryResponseDto(graph));
  }

  /**
   * Search for graphs by name or description
   */
  async searchGraphs(userId: string, query: string): Promise<GraphSummaryResponseDto[]> {
    const graphs = await this.graphRepository.search(query, userId);
    return graphs.map(graph => this.mapToGraphSummaryResponseDto(graph));
  }

  /**
   * Update a graph
   */
  async updateGraph(userId: string, graphId: string, updateGraphDto: UpdateGraphDto): Promise<GraphResponseDto> {
    // Get the existing graph
    const graph = await this.getGraphEntityWithAccessCheck(userId, graphId);
    
    // Update the graph metadata
    if (Object.keys(updateGraphDto).length > 0) {
      const { settings, ...metadataUpdates } = updateGraphDto;
      
      // Update metadata (name, description, tags)
      if (Object.keys(metadataUpdates).length > 0) {
        graph.updateMetadata(metadataUpdates);
      }
      
      // Update settings if provided
      if (settings) {
        graph.updateSettings(settings);
      }
    }
    
    // Save the updated graph
    const updatedGraph = await this.graphRepository.save(graph);
    
    return this.mapToGraphResponseDto(updatedGraph);
  }

  /**
   * Delete a graph
   */
  async deleteGraph(userId: string, graphId: string): Promise<boolean> {
    // Get the existing graph
    const graph = await this.getGraphEntityWithAccessCheck(userId, graphId);
    
    // Only the owner can delete the graph
    if (graph.ownerId !== userId) {
      throw new ForbiddenException('Only the owner can delete the graph');
    }
    
    // Delete the graph
    return this.graphRepository.delete(graphId);
  }

  /**
   * Add a node to a graph
   */
  async addNode(userId: string, graphId: string, createNodeDto: CreateNodeDto): Promise<GraphResponseDto> {
    // Get the existing graph
    const graph = await this.getGraphEntityWithAccessCheck(userId, graphId);
    
    // Add the node
    graph.addNode(createNodeDto);
    
    // Save the updated graph
    const updatedGraph = await this.graphRepository.save(graph);
    
    return this.mapToGraphResponseDto(updatedGraph);
  }

  /**
   * Update a node in a graph
   */
  async updateNode(userId: string, graphId: string, nodeId: string, updateNodeDto: UpdateNodeDto): Promise<GraphResponseDto> {
    // Get the existing graph
    const graph = await this.getGraphEntityWithAccessCheck(userId, graphId);
    
    // Get the node
    const node = graph.getNode(nodeId);
    if (!node) {
      throw new NotFoundException(`Node with ID ${nodeId} not found in graph ${graphId}`);
    }
    
    // Update the node properties
    if (updateNodeDto.title) {
      node.updateTitle(updateNodeDto.title);
    }
    
    if (updateNodeDto.position) {
      node.updatePosition(updateNodeDto.position.x, updateNodeDto.position.y);
    }
    
    if (updateNodeDto.displaySettings) {
      node.updateDisplaySettings(updateNodeDto.displaySettings);
    }
    
    if (updateNodeDto.isPinned !== undefined) {
      if (updateNodeDto.isPinned && !node.isPinned) {
        node.togglePin();
      } else if (!updateNodeDto.isPinned && node.isPinned) {
        node.togglePin();
      }
    }
    
    if (updateNodeDto.isExpanded !== undefined) {
      if (updateNodeDto.isExpanded && !node.isExpanded) {
        node.toggleExpanded();
      } else if (!updateNodeDto.isExpanded && node.isExpanded) {
        node.toggleExpanded();
      }
    }
    
    // Save the updated graph
    const updatedGraph = await this.graphRepository.save(graph);
    
    return this.mapToGraphResponseDto(updatedGraph);
  }

  /**
   * Remove a node from a graph
   */
  async removeNode(userId: string, graphId: string, nodeId: string): Promise<GraphResponseDto> {
    // Get the existing graph
    const graph = await this.getGraphEntityWithAccessCheck(userId, graphId);
    
    // Remove the node
    const nodeRemoved = graph.removeNode(nodeId);
    if (!nodeRemoved) {
      throw new NotFoundException(`Node with ID ${nodeId} not found in graph ${graphId}`);
    }
    
    // Save the updated graph
    const updatedGraph = await this.graphRepository.save(graph);
    
    return this.mapToGraphResponseDto(updatedGraph);
  }

  /**
   * Add an edge to a graph
   */
  async addEdge(userId: string, graphId: string, createEdgeDto: CreateEdgeDto): Promise<GraphResponseDto> {
    // Get the existing graph
    const graph = await this.getGraphEntityWithAccessCheck(userId, graphId);
    
    // Add the edge
    const edge = graph.addEdge(createEdgeDto);
    if (!edge) {
      throw new NotFoundException('Source or target node not found in the graph');
    }
    
    // Save the updated graph
    const updatedGraph = await this.graphRepository.save(graph);
    
    return this.mapToGraphResponseDto(updatedGraph);
  }

  /**
   * Update an edge in a graph
   */
  async updateEdge(userId: string, graphId: string, edgeId: string, updateEdgeDto: UpdateEdgeDto): Promise<GraphResponseDto> {
    // Get the existing graph
    const graph = await this.getGraphEntityWithAccessCheck(userId, graphId);
    
    // Get the edge
    const edge = graph.getEdge(edgeId);
    if (!edge) {
      throw new NotFoundException(`Edge with ID ${edgeId} not found in graph ${graphId}`);
    }
    
    // Update the edge properties
    if (updateEdgeDto.label) {
      edge.updateLabel(updateEdgeDto.label);
    }
    
    if (updateEdgeDto.weight !== undefined) {
      edge.updateWeight(updateEdgeDto.weight);
    }
    
    if (updateEdgeDto.isBidirectional !== undefined) {
      if (updateEdgeDto.isBidirectional && !edge.isBidirectional) {
        edge.toggleBidirectionality();
      } else if (!updateEdgeDto.isBidirectional && edge.isBidirectional) {
        edge.toggleBidirectionality();
      }
    }
    
    if (updateEdgeDto.displaySettings) {
      edge.updateDisplaySettings(updateEdgeDto.displaySettings);
    }
    
    // Save the updated graph
    const updatedGraph = await this.graphRepository.save(graph);
    
    return this.mapToGraphResponseDto(updatedGraph);
  }

  /**
   * Remove an edge from a graph
   */
  async removeEdge(userId: string, graphId: string, edgeId: string): Promise<GraphResponseDto> {
    // Get the existing graph
    const graph = await this.getGraphEntityWithAccessCheck(userId, graphId);
    
    // Remove the edge
    const edgeRemoved = graph.removeEdge(edgeId);
    if (!edgeRemoved) {
      throw new NotFoundException(`Edge with ID ${edgeId} not found in graph ${graphId}`);
    }
    
    // Save the updated graph
    const updatedGraph = await this.graphRepository.save(graph);
    
    return this.mapToGraphResponseDto(updatedGraph);
  }

  /**
   * Get a graph entity with access check
   */
  private async getGraphEntityWithAccessCheck(userId: string, graphId: string): Promise<Graph> {
    const graph = await this.graphRepository.findById(graphId);
    
    if (!graph) {
      throw new NotFoundException(`Graph with ID ${graphId} not found`);
    }

    // Check if user has access to the graph
    this.validateGraphAccess(userId, graph);
    
    return graph;
  }

  /**
   * Validate if a user has access to a graph
   */
  private validateGraphAccess(userId: string, graph: Graph): void {
    const hasAccess = graph.ownerId === userId || 
                      graph.sharedWith.includes(userId) || 
                      graph.isPublic;
                      
    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this graph');
    }
  }

  /**
   * Get default graph settings
   */
  private getDefaultGraphSettings(): any {
    return GraphSettings.createDefault().toJSON();
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

  /**
   * Map a Graph entity to a GraphSummaryResponseDto
   */
  private mapToGraphSummaryResponseDto(graph: Graph): GraphSummaryResponseDto {
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
      nodeCount: graph.nodeCount,
      edgeCount: graph.edgeCount,
    };
  }
} 