import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { GraphTheme, LayoutAlgorithm } from '../../../domain/models/graph-settings.value-object';
import { NodeType } from '../../../domain/models/node.entity';
import { EdgeType } from '../../../domain/models/edge.entity';

// Node Schema
@Schema({ _id: false })
export class NodePositionDocument {
  @Prop({ required: true, type: Number })
  x: number;

  @Prop({ required: true, type: Number })
  y: number;
}

@Schema({ _id: false })
export class NodeMetadataDocument {
  @Prop({ type: String })
  description?: string;

  @Prop({ type: Date })
  lastModified?: Date;

  @Prop({ type: [String] })
  tags?: string[];

  @Prop({ type: Object })
  properties?: Record<string, any>;
}

@Schema({ _id: false })
export class NodeDisplaySettingsDocument {
  @Prop({ type: Number })
  size?: number;

  @Prop({ type: String })
  color?: string;

  @Prop({ type: String })
  className?: string;
}

@Schema({ _id: false })
export class NodeDocument {
  @Prop({ required: true, type: String })
  id: string;

  @Prop({ required: true, type: String })
  notionId: string;

  @Prop({ required: true, type: String })
  title: string;

  @Prop({ required: true, type: String, enum: Object.values(NodeType) })
  type: NodeType;

  @Prop({ type: String })
  icon?: string;

  @Prop({ type: NodePositionDocument })
  position?: NodePositionDocument;

  @Prop({ type: NodeMetadataDocument })
  metadata?: NodeMetadataDocument;

  @Prop({ type: Boolean, default: false })
  isPinned: boolean;

  @Prop({ type: Boolean, default: false })
  isExpanded: boolean;

  @Prop({ type: NodeDisplaySettingsDocument })
  displaySettings?: NodeDisplaySettingsDocument;
}

// Edge Schema
@Schema({ _id: false })
export class EdgeMetadataDocument {
  @Prop({ type: Date })
  createdAt?: Date;

  @Prop({ type: String })
  context?: string;

  @Prop({ type: Object })
  properties?: Record<string, any>;
}

@Schema({ _id: false })
export class EdgeDisplaySettingsDocument {
  @Prop({ type: String })
  color?: string;

  @Prop({ type: Number })
  thickness?: number;

  @Prop({ type: String, enum: ['solid', 'dashed', 'dotted'] })
  style?: 'solid' | 'dashed' | 'dotted';

  @Prop({ type: String })
  className?: string;
}

@Schema({ _id: false })
export class EdgeDocument {
  @Prop({ required: true, type: String })
  id: string;

  @Prop({ required: true, type: String })
  sourceId: string;

  @Prop({ required: true, type: String })
  targetId: string;

  @Prop({ required: true, type: String, enum: Object.values(EdgeType) })
  type: EdgeType;

  @Prop({ type: String })
  label?: string;

  @Prop({ type: Number, default: 1 })
  weight: number;

  @Prop({ type: Boolean, default: false })
  isBidirectional: boolean;

  @Prop({ type: EdgeMetadataDocument })
  metadata?: EdgeMetadataDocument;

  @Prop({ type: EdgeDisplaySettingsDocument })
  displaySettings?: EdgeDisplaySettingsDocument;
}

// Graph Settings Schema
@Schema({ _id: false })
export class GraphCustomColorsDocument {
  @Prop({ required: true, type: String })
  background: string;

  @Prop({ required: true, type: String })
  node: string;

  @Prop({ required: true, type: String })
  edge: string;

  @Prop({ required: true, type: String })
  text: string;

  @Prop({ required: true, type: String })
  highlight: string;
}

@Schema({ _id: false })
export class GraphNodeSizeDocument {
  @Prop({ required: true, type: Number })
  default: number;

  @Prop({ required: true, type: Boolean })
  scaleByConnections: boolean;

  @Prop({ required: true, type: Number })
  min: number;

  @Prop({ required: true, type: Number })
  max: number;
}

@Schema({ _id: false })
export class GraphEdgeSettingsDocument {
  @Prop({ required: true, type: Number })
  thickness: number;

  @Prop({ required: true, type: Boolean })
  scaleByWeight: boolean;

  @Prop({ required: true, type: String, enum: ['solid', 'dashed', 'dotted'] })
  style: 'solid' | 'dashed' | 'dotted';
}

@Schema({ _id: false })
export class VisualSettingsDocument {
  @Prop({ required: true, type: String, enum: Object.values(GraphTheme) })
  theme: GraphTheme;

  @Prop({ type: GraphCustomColorsDocument })
  customColors?: GraphCustomColorsDocument;

  @Prop({ required: true, type: GraphNodeSizeDocument })
  nodeSize: GraphNodeSizeDocument;

  @Prop({ required: true, type: GraphEdgeSettingsDocument })
  edgeSettings: GraphEdgeSettingsDocument;

  @Prop({ required: true, type: Boolean })
  showLabels: boolean;

  @Prop({ required: true, type: Boolean })
  showIcons: boolean;

  @Prop({ required: true, type: Boolean })
  antialiasing: boolean;
}

@Schema({ _id: false })
export class RelationshipSettingsDocument {
  @Prop({ required: true, type: Boolean })
  showParentChild: boolean;

  @Prop({ required: true, type: Boolean })
  showDatabaseRelations: boolean;

  @Prop({ required: true, type: Boolean })
  showBacklinks: boolean;

  @Prop({ required: true, type: Boolean })
  highlightBidirectionalLinks: boolean;

  @Prop({ type: Number })
  maxDistance?: number;
}

@Schema({ _id: false })
export class DateRangeDocument {
  @Prop({ type: Date })
  startDate?: Date;

  @Prop({ type: Date })
  endDate?: Date;
}

@Schema({ _id: false })
export class FilterSettingsDocument {
  @Prop({ required: true, type: Boolean })
  includePages: boolean;

  @Prop({ required: true, type: Boolean })
  includeDatabases: boolean;

  @Prop({ type: Number })
  minConnections?: number;

  @Prop({ type: DateRangeDocument })
  dateRange?: DateRangeDocument;

  @Prop({ type: String })
  searchText?: string;

  @Prop({ type: [String] })
  includeTags?: string[];

  @Prop({ type: [String] })
  excludeTags?: string[];

  @Prop({ required: true, type: Boolean })
  onlyShowNeighbors: boolean;
}

@Schema({ _id: false })
export class PhysicsSettingsDocument {
  @Prop({ required: true, type: Number })
  gravitationalConstant: number;

  @Prop({ required: true, type: Number })
  springConstant: number;

  @Prop({ required: true, type: Number })
  springLength: number;

  @Prop({ required: true, type: Number })
  damping: number;

  @Prop({ required: true, type: Boolean })
  enabled: boolean;
}

@Schema({ _id: false })
export class ZoomLimitsDocument {
  @Prop({ required: true, type: Number })
  min: number;

  @Prop({ required: true, type: Number })
  max: number;
}

@Schema({ _id: false })
export class InteractionSettingsDocument {
  @Prop({ required: true, type: Boolean })
  draggable: boolean;

  @Prop({ required: true, type: ZoomLimitsDocument })
  zoomLimits: ZoomLimitsDocument;

  @Prop({ required: true, type: String, enum: ['select', 'expand', 'navigate'] })
  clickBehavior: 'select' | 'expand' | 'navigate';

  @Prop({ required: true, type: Boolean })
  multiSelect: boolean;

  @Prop({ required: true, type: Boolean })
  hideDisconnectedOnSelect: boolean;

  @Prop({ required: true, type: Boolean })
  showDetailsOnHover: boolean;
}

@Schema({ _id: false })
export class GraphSettingsDocument {
  @Prop({ required: true, type: String, enum: Object.values(LayoutAlgorithm) })
  layout: LayoutAlgorithm;

  @Prop({ type: Object })
  layoutSettings?: Record<string, any>;

  @Prop({ required: true, type: VisualSettingsDocument })
  visualSettings: VisualSettingsDocument;

  @Prop({ required: true, type: RelationshipSettingsDocument })
  relationshipSettings: RelationshipSettingsDocument;

  @Prop({ required: true, type: FilterSettingsDocument })
  filterSettings: FilterSettingsDocument;

  @Prop({ required: true, type: PhysicsSettingsDocument })
  physicsSettings: PhysicsSettingsDocument;

  @Prop({ required: true, type: InteractionSettingsDocument })
  interactionSettings: InteractionSettingsDocument;
}

// Main Graph Document
@Schema({ collection: 'graphs', timestamps: true })
export class GraphDocument extends Document {
  @Prop({ required: true, type: String })
  id: string;

  @Prop({ required: true, type: String })
  name: string;

  @Prop({ required: true, type: String })
  ownerId: string;

  @Prop({ type: String, default: '' })
  description: string;

  @Prop({ type: String })
  workspaceId?: string;

  @Prop({ type: String })
  sourceDatabaseId?: string;

  @Prop({ type: Date, default: () => new Date() })
  createdAt: Date;

  @Prop({ type: Date, default: () => new Date() })
  updatedAt: Date;

  @Prop({ type: Boolean, default: false })
  isPublic: boolean;

  @Prop({ type: [String], default: [] })
  sharedWith: string[];

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ type: [NodeDocument], default: [] })
  nodes: NodeDocument[];

  @Prop({ type: [EdgeDocument], default: [] })
  edges: EdgeDocument[];

  @Prop({ required: true, type: GraphSettingsDocument })
  settings: GraphSettingsDocument;
}

export const GraphSchema = SchemaFactory.createForClass(GraphDocument);
export const NodeSchema = SchemaFactory.createForClass(NodeDocument);
export const EdgeSchema = SchemaFactory.createForClass(EdgeDocument); 