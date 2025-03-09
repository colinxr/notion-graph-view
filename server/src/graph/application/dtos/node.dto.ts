import { IsString, IsOptional, IsEnum, IsObject, IsBoolean, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { NodeType } from '../../domain/models/node.entity';

/**
 * DTO for node position in a graph
 */
export class NodePositionDto {
  @IsObject()
  x: number;

  @IsObject()
  y: number;
}

/**
 * DTO for node metadata
 */
export class NodeMetadataDto {
  @IsString()
  @IsOptional()
  description?: string;

  @IsOptional()
  lastModified?: Date;

  @IsOptional()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsObject()
  properties?: Record<string, any>;
}

/**
 * DTO for node display settings
 */
export class NodeDisplaySettingsDto {
  @IsOptional()
  size?: number;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  className?: string;
}

/**
 * DTO for creating a node
 */
export class CreateNodeDto {
  @IsString()
  notionId: string;

  @IsString()
  title: string;

  @IsEnum(NodeType)
  type: NodeType;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => NodePositionDto)
  position?: NodePositionDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => NodeMetadataDto)
  metadata?: NodeMetadataDto;

  @IsOptional()
  @IsBoolean()
  isPinned?: boolean;

  @IsOptional()
  @IsBoolean()
  isExpanded?: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => NodeDisplaySettingsDto)
  displaySettings?: NodeDisplaySettingsDto;
}

/**
 * DTO for updating a node
 */
export class UpdateNodeDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => NodePositionDto)
  position?: NodePositionDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => NodeMetadataDto)
  metadata?: NodeMetadataDto;

  @IsOptional()
  @IsBoolean()
  isPinned?: boolean;

  @IsOptional()
  @IsBoolean()
  isExpanded?: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => NodeDisplaySettingsDto)
  displaySettings?: NodeDisplaySettingsDto;
}

/**
 * DTO for node response
 */
export class NodeResponseDto {
  id: string;
  notionId: string;
  title: string;
  type: NodeType;
  icon?: string;
  position?: NodePositionDto;
  metadata?: NodeMetadataDto;
  isPinned: boolean;
  isExpanded: boolean;
  displaySettings?: NodeDisplaySettingsDto;
} 