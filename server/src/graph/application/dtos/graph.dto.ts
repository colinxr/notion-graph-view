import { IsString, IsOptional, IsBoolean, IsArray, IsEnum, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { GraphTheme, LayoutAlgorithm } from '../../domain/models/graph-settings.value-object';
import { CreateNodeDto, NodeResponseDto } from './node.dto';
import { CreateEdgeDto, EdgeResponseDto } from './edge.dto';

/**
 * DTO for graph visual settings
 */
export class VisualSettingsDto {
  @IsEnum(GraphTheme)
  theme: GraphTheme;

  @IsOptional()
  @IsObject()
  customColors?: {
    background: string;
    node: string;
    edge: string;
    text: string;
    highlight: string;
  };

  @IsObject()
  nodeSize: {
    default: number;
    scaleByConnections: boolean;
    min: number;
    max: number;
  };

  @IsObject()
  edgeSettings: {
    thickness: number;
    scaleByWeight: boolean;
    style: 'solid' | 'dashed' | 'dotted';
  };

  @IsBoolean()
  showLabels: boolean;

  @IsBoolean()
  showIcons: boolean;

  @IsBoolean()
  antialiasing: boolean;
}

/**
 * DTO for relationship settings
 */
export class RelationshipSettingsDto {
  @IsBoolean()
  showParentChild: boolean;

  @IsBoolean()
  showDatabaseRelations: boolean;

  @IsBoolean()
  showBacklinks: boolean;

  @IsBoolean()
  highlightBidirectionalLinks: boolean;

  @IsOptional()
  maxDistance?: number;
}

/**
 * DTO for filter settings
 */
export class FilterSettingsDto {
  @IsBoolean()
  includePages: boolean;

  @IsBoolean()
  includeDatabases: boolean;

  @IsOptional()
  minConnections?: number;

  @IsOptional()
  @IsObject()
  dateRange?: {
    startDate?: Date;
    endDate?: Date;
  };

  @IsOptional()
  @IsString()
  searchText?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  includeTags?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  excludeTags?: string[];

  @IsBoolean()
  onlyShowNeighbors: boolean;
}

/**
 * DTO for physics settings
 */
export class PhysicsSettingsDto {
  @IsObject()
  gravitationalConstant: number;

  @IsObject()
  springConstant: number;

  @IsObject()
  springLength: number;

  @IsObject()
  damping: number;

  @IsBoolean()
  enabled: boolean;
}

/**
 * DTO for interaction settings
 */
export class InteractionSettingsDto {
  @IsBoolean()
  draggable: boolean;

  @IsObject()
  zoomLimits: {
    min: number;
    max: number;
  };

  @IsString()
  clickBehavior: 'select' | 'expand' | 'navigate';

  @IsBoolean()
  multiSelect: boolean;

  @IsBoolean()
  hideDisconnectedOnSelect: boolean;

  @IsBoolean()
  showDetailsOnHover: boolean;
}

/**
 * DTO for graph settings
 */
export class GraphSettingsDto {
  @IsEnum(LayoutAlgorithm)
  layout: LayoutAlgorithm;

  @IsOptional()
  @IsObject()
  layoutSettings?: Record<string, any>;

  @ValidateNested()
  @Type(() => VisualSettingsDto)
  visualSettings: VisualSettingsDto;

  @ValidateNested()
  @Type(() => RelationshipSettingsDto)
  relationshipSettings: RelationshipSettingsDto;

  @ValidateNested()
  @Type(() => FilterSettingsDto)
  filterSettings: FilterSettingsDto;

  @ValidateNested()
  @Type(() => PhysicsSettingsDto)
  physicsSettings: PhysicsSettingsDto;

  @ValidateNested()
  @Type(() => InteractionSettingsDto)
  interactionSettings: InteractionSettingsDto;
}

/**
 * DTO for creating a graph
 */
export class CreateGraphDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  workspaceId?: string;

  @IsOptional()
  @IsString()
  sourceDatabaseId?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateNodeDto)
  nodes?: CreateNodeDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateEdgeDto)
  edges?: CreateEdgeDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => GraphSettingsDto)
  settings?: GraphSettingsDto;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

/**
 * DTO for updating a graph
 */
export class UpdateGraphDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => GraphSettingsDto)
  settings?: GraphSettingsDto;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

/**
 * DTO for sharing a graph
 */
export class ShareGraphDto {
  @IsArray()
  @IsString({ each: true })
  userIds: string[];
}

/**
 * DTO for setting public visibility of a graph
 */
export class SetPublicVisibilityDto {
  @IsBoolean()
  isPublic: boolean;
}

/**
 * DTO for graph response
 */
export class GraphResponseDto {
  id: string;
  name: string;
  ownerId: string;
  description: string;
  workspaceId?: string;
  sourceDatabaseId?: string;
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
  sharedWith: string[];
  tags: string[];
  nodes: NodeResponseDto[];
  edges: EdgeResponseDto[];
  settings: GraphSettingsDto;
}

/**
 * DTO for graph summary response (without nodes and edges)
 */
export class GraphSummaryResponseDto {
  id: string;
  name: string;
  ownerId: string;
  description: string;
  workspaceId?: string;
  sourceDatabaseId?: string;
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
  sharedWith: string[];
  tags: string[];
  nodeCount: number;
  edgeCount: number;
}

/**
 * DTO for embedding a graph
 */
export class GraphEmbedDto {
  graphId: string;
  title?: string;
  width?: string;
  height?: string;
  theme?: GraphTheme;
  allowInteraction?: boolean;
  showControls?: boolean;
  autoFit?: boolean;
} 