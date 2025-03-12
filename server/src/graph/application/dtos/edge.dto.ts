import { IsString, IsOptional, IsEnum, IsObject, IsBoolean, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { EdgeType } from '../../domain/models/edge.entity';

/**
 * DTO for edge metadata
 */
export class EdgeMetadataDto {
  @IsOptional()
  createdAt?: Date;

  @IsOptional()
  @IsString()
  context?: string;

  @IsOptional()
  @IsObject()
  properties?: Record<string, any>;
}

/**
 * DTO for edge display settings
 */
export class EdgeDisplaySettingsDto {
  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsNumber()
  thickness?: number;

  @IsOptional()
  @IsString()
  style?: 'solid' | 'dashed' | 'dotted';

  @IsOptional()
  @IsString()
  className?: string;
}

/**
 * DTO for creating an edge
 */
export class CreateEdgeDto {
  @IsString()
  sourceId: string;

  @IsString()
  targetId: string;

  @IsEnum(EdgeType)
  type: EdgeType;

  @IsOptional()
  @IsString()
  label?: string;

  @IsOptional()
  @IsNumber()
  weight?: number;

  @IsOptional()
  @IsBoolean()
  isBidirectional?: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => EdgeMetadataDto)
  metadata?: EdgeMetadataDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => EdgeDisplaySettingsDto)
  displaySettings?: EdgeDisplaySettingsDto;
}

/**
 * DTO for updating an edge
 */
export class UpdateEdgeDto {
  @IsOptional()
  @IsString()
  label?: string;

  @IsOptional()
  @IsNumber()
  weight?: number;

  @IsOptional()
  @IsBoolean()
  isBidirectional?: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => EdgeMetadataDto)
  metadata?: EdgeMetadataDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => EdgeDisplaySettingsDto)
  displaySettings?: EdgeDisplaySettingsDto;
}

/**
 * DTO for edge response
 */
export class EdgeResponseDto {
  id: string;
  sourceId: string;
  targetId: string;
  type: EdgeType;
  label?: string;
  weight: number;
  isBidirectional: boolean;
  metadata?: EdgeMetadataDto;
  displaySettings?: EdgeDisplaySettingsDto;
} 