import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpStatus,
  HttpCode,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { GraphService } from '../../../application/services/graph.service';
import { GraphGeneratorService } from '../../../application/services/graph-generator.service';
import {
  CreateGraphDto,
  UpdateGraphDto,
  GraphResponseDto,
  GraphSummaryResponseDto,
  GraphSettingsDto,
} from '../../../application/dtos/graph.dto';
import { CreateNodeDto, UpdateNodeDto, NodeResponseDto } from '../../../application/dtos/node.dto';
import { CreateEdgeDto, UpdateEdgeDto, EdgeResponseDto } from '../../../application/dtos/edge.dto';
import { AuthGuard } from '../../../../iam/interfaces/http/guards/auth.guard';

@ApiTags('Graphs')
@ApiBearerAuth()
@Controller('graphs')
@UseGuards(AuthGuard)
export class GraphController {
  constructor(
    private readonly graphService: GraphService,
    private readonly graphGeneratorService: GraphGeneratorService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new graph' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Graph created successfully', type: GraphResponseDto })
  async createGraph(
    @Request() req: { user: { id: string } },
    @Body() createGraphDto: CreateGraphDto
  ): Promise<GraphResponseDto> {
    return this.graphService.createGraph(req.user.id, createGraphDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all graphs accessible to the user' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Graphs retrieved successfully', type: [GraphSummaryResponseDto] })
  @ApiQuery({ name: 'owned', required: false, description: 'Filter to only show owned graphs' })
  async getGraphs(
    @Request() req: { user: { id: string } },
    @Query('owned') owned?: boolean
  ): Promise<GraphSummaryResponseDto[]> {
    if (owned) {
      return this.graphService.getOwnedGraphs(req.user.id);
    } else {
      return this.graphService.getAccessibleGraphs(req.user.id);
    }
  }

  @Get('public')
  @ApiOperation({ summary: 'Get public graphs' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Public graphs retrieved successfully', type: [GraphSummaryResponseDto] })
  @ApiQuery({ name: 'limit', required: false, description: 'Maximum number of graphs to return' })
  @ApiQuery({ name: 'offset', required: false, description: 'Number of graphs to skip' })
  async getPublicGraphs(
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<GraphSummaryResponseDto[]> {
    return this.graphService.getPublicGraphs(limit, offset);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search for graphs' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Search results retrieved successfully', type: [GraphSummaryResponseDto] })
  @ApiQuery({ name: 'query', required: true, description: 'Search query' })
  async searchGraphs(
    @Request() req: { user: { id: string } },
    @Query('query') query: string
  ): Promise<GraphSummaryResponseDto[]> {
    return this.graphService.searchGraphs(req.user.id, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a graph by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Graph retrieved successfully', type: GraphResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Graph not found' })
  @ApiParam({ name: 'id', description: 'Graph ID' })
  async getGraphById(
    @Request() req: { user: { id: string } },
    @Param('id') graphId: string
  ): Promise<GraphResponseDto> {
    return this.graphService.getGraphById(req.user.id, graphId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a graph' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Graph updated successfully', type: GraphResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Graph not found' })
  @ApiParam({ name: 'id', description: 'Graph ID' })
  async updateGraph(
    @Request() req: { user: { id: string } },
    @Param('id') graphId: string,
    @Body() updateGraphDto: UpdateGraphDto,
  ): Promise<GraphResponseDto> {
    return this.graphService.updateGraph(req.user.id, graphId, updateGraphDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a graph' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Graph deleted successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Graph not found' })
  @ApiParam({ name: 'id', description: 'Graph ID' })
  async deleteGraph(
    @Request() req: { user: { id: string } },
    @Param('id') graphId: string
  ): Promise<void> {
    const result = await this.graphService.deleteGraph(req.user.id, graphId);
    if (!result) {
      throw new NotFoundException(`Graph with ID ${graphId} not found`);
    }
  }

  @Post(':id/nodes')
  @ApiOperation({ summary: 'Add a node to a graph' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Node added successfully', type: GraphResponseDto })
  @ApiParam({ name: 'id', description: 'Graph ID' })
  async addNode(
    @Request() req: { user: { id: string } },
    @Param('id') graphId: string,
    @Body() createNodeDto: CreateNodeDto,
  ): Promise<GraphResponseDto> {
    return this.graphService.addNode(req.user.id, graphId, createNodeDto);
  }

  @Put(':id/nodes/:nodeId')
  @ApiOperation({ summary: 'Update a node in a graph' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Node updated successfully', type: GraphResponseDto })
  @ApiParam({ name: 'id', description: 'Graph ID' })
  @ApiParam({ name: 'nodeId', description: 'Node ID' })
  async updateNode(
    @Request() req: { user: { id: string } },
    @Param('id') graphId: string,
    @Param('nodeId') nodeId: string,
    @Body() updateNodeDto: UpdateNodeDto,
  ): Promise<GraphResponseDto> {
    return this.graphService.updateNode(req.user.id, graphId, nodeId, updateNodeDto);
  }

  @Delete(':id/nodes/:nodeId')
  @ApiOperation({ summary: 'Remove a node from a graph' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Node removed successfully', type: GraphResponseDto })
  @ApiParam({ name: 'id', description: 'Graph ID' })
  @ApiParam({ name: 'nodeId', description: 'Node ID' })
  async removeNode(
    @Request() req: { user: { id: string } },
    @Param('id') graphId: string,
    @Param('nodeId') nodeId: string,
  ): Promise<GraphResponseDto> {
    return this.graphService.removeNode(req.user.id, graphId, nodeId);
  }

  @Post(':id/edges')
  @ApiOperation({ summary: 'Add an edge to a graph' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Edge added successfully', type: GraphResponseDto })
  @ApiParam({ name: 'id', description: 'Graph ID' })
  async addEdge(
    @Request() req: { user: { id: string } },
    @Param('id') graphId: string,
    @Body() createEdgeDto: CreateEdgeDto,
  ): Promise<GraphResponseDto> {
    return this.graphService.addEdge(req.user.id, graphId, createEdgeDto);
  }

  @Put(':id/edges/:edgeId')
  @ApiOperation({ summary: 'Update an edge in a graph' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Edge updated successfully', type: GraphResponseDto })
  @ApiParam({ name: 'id', description: 'Graph ID' })
  @ApiParam({ name: 'edgeId', description: 'Edge ID' })
  async updateEdge(
    @Request() req: { user: { id: string } },
    @Param('id') graphId: string,
    @Param('edgeId') edgeId: string,
    @Body() updateEdgeDto: UpdateEdgeDto,
  ): Promise<GraphResponseDto> {
    return this.graphService.updateEdge(req.user.id, graphId, edgeId, updateEdgeDto);
  }

  @Delete(':id/edges/:edgeId')
  @ApiOperation({ summary: 'Remove an edge from a graph' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Edge removed successfully', type: GraphResponseDto })
  @ApiParam({ name: 'id', description: 'Graph ID' })
  @ApiParam({ name: 'edgeId', description: 'Edge ID' })
  async removeEdge(
    @Request() req: { user: { id: string } },
    @Param('id') graphId: string,
    @Param('edgeId') edgeId: string,
  ): Promise<GraphResponseDto> {
    return this.graphService.removeEdge(req.user.id, graphId, edgeId);
  }

  @Post('generate/database/:databaseId')
  @ApiOperation({ summary: 'Generate a graph from a Notion database' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Graph generated successfully', type: GraphResponseDto })
  @ApiParam({ name: 'databaseId', description: 'Notion database ID' })
  @ApiQuery({ name: 'name', required: true, description: 'Name for the generated graph' })
  @ApiQuery({ name: 'description', required: false, description: 'Description for the generated graph' })
  @ApiQuery({ name: 'maxDepth', required: false, description: 'Maximum depth for backlink traversal' })
  async generateFromDatabase(
    @Request() req: { user: { id: string } },
    @Param('databaseId') databaseId: string,
    @Query('name') name: string,
    @Query('description') description?: string,
    @Query('maxDepth') maxDepth?: number,
  ): Promise<GraphResponseDto> {
    const graph = await this.graphGeneratorService.generateFromDatabase(
      req.user.id,
      databaseId,
      name,
      description,
      maxDepth ? parseInt(maxDepth.toString(), 10) : 2,
    );

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

  @Post('generate/page/:pageId')
  @ApiOperation({ summary: 'Generate a graph from a Notion page and its backlinks' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Graph generated successfully', type: GraphResponseDto })
  @ApiParam({ name: 'pageId', description: 'Notion page ID' })
  @ApiQuery({ name: 'name', required: true, description: 'Name for the generated graph' })
  @ApiQuery({ name: 'description', required: false, description: 'Description for the generated graph' })
  @ApiQuery({ name: 'maxDepth', required: false, description: 'Maximum depth for backlink traversal' })
  async generateFromPage(
    @Request() req: { user: { id: string } },
    @Param('pageId') pageId: string,
    @Query('name') name: string,
    @Query('description') description?: string,
    @Query('maxDepth') maxDepth?: number,
  ): Promise<GraphResponseDto> {
    const graph = await this.graphGeneratorService.generateFromPage(
      req.user.id,
      pageId,
      name,
      description,
      maxDepth ? parseInt(maxDepth.toString(), 10) : 2,
    );

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

  @Post('combine')
  @ApiOperation({ summary: 'Combine multiple graphs into a new graph' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Graphs combined successfully', type: GraphResponseDto })
  @ApiQuery({ name: 'name', required: true, description: 'Name for the combined graph' })
  @ApiQuery({ name: 'description', required: false, description: 'Description for the combined graph' })
  async combineGraphs(
    @Request() req: { user: { id: string } },
    @Body() graphIds: string[],
    @Query('name') name: string,
    @Query('description') description?: string,
  ): Promise<GraphResponseDto> {
    const graph = await this.graphGeneratorService.combineGraphs(
      req.user.id,
      graphIds,
      name,
      description,
    );

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