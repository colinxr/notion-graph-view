import { v4 as uuidv4 } from 'uuid';

export enum EdgeType {
  /** Direct link/reference from one page to another */
  REFERENCE = 'reference',
  /** Parent-child relationship */
  PARENT_CHILD = 'parent_child',
  /** Pages in the same database */
  DATABASE_RELATION = 'database_relation',
  /** Custom defined relation */
  CUSTOM = 'custom',
}

export interface EdgeData {
  /** Unique identifier for this edge */
  id?: string;
  
  /** Source node ID */
  sourceId: string;
  
  /** Target node ID */
  targetId: string;
  
  /** Type of relationship */
  type: EdgeType;
  
  /** Label for the edge (optional) */
  label?: string;
  
  /** Strength or weight of the connection */
  weight?: number;
  
  /** Whether the edge is bidirectional */
  isBidirectional?: boolean;
  
  /** Additional metadata about the connection */
  metadata?: {
    /** When the connection was established/found */
    createdAt?: Date;
    /** Context of the reference, e.g. snippet of text containing the link */
    context?: string;
    /** Any custom properties */
    properties?: Record<string, any>;
  };
  
  /** Display settings */
  displaySettings?: {
    /** Edge color */
    color?: string;
    /** Edge thickness */
    thickness?: number;
    /** Edge style (solid, dashed, etc.) */
    style?: 'solid' | 'dashed' | 'dotted';
    /** Custom CSS class */
    className?: string;
  };
}

/**
 * Edge entity represents a connection between two nodes in the graph
 */
export class Edge {
  /** Unique identifier for this edge */
  public readonly id: string;
  
  /** Source node ID */
  public readonly sourceId: string;
  
  /** Target node ID */
  public readonly targetId: string;
  
  /** Type of relationship */
  public readonly type: EdgeType;
  
  /** Label for the edge (optional) */
  public label?: string;
  
  /** Strength or weight of the connection */
  public weight: number;
  
  /** Whether the edge is bidirectional */
  public isBidirectional: boolean;
  
  /** Additional metadata about the connection */
  public metadata?: {
    /** When the connection was established/found */
    createdAt?: Date;
    /** Context of the reference, e.g. snippet of text containing the link */
    context?: string;
    /** Any custom properties */
    properties?: Record<string, any>;
  };
  
  /** Display settings */
  public displaySettings?: {
    /** Edge color */
    color?: string;
    /** Edge thickness */
    thickness?: number;
    /** Edge style (solid, dashed, etc.) */
    style?: 'solid' | 'dashed' | 'dotted';
    /** Custom CSS class */
    className?: string;
  };

  constructor(data: EdgeData) {
    this.id = data.id || uuidv4();
    this.sourceId = data.sourceId;
    this.targetId = data.targetId;
    this.type = data.type;
    this.label = data.label;
    this.weight = data.weight || 1;
    this.isBidirectional = data.isBidirectional || false;
    this.metadata = data.metadata;
    this.displaySettings = data.displaySettings;
  }

  /**
   * Update the edge label
   */
  public updateLabel(label: string): void {
    this.label = label;
  }

  /**
   * Update the edge weight
   */
  public updateWeight(weight: number): void {
    this.weight = weight;
  }

  /**
   * Toggle bidirectionality of the edge
   */
  public toggleBidirectionality(): void {
    this.isBidirectional = !this.isBidirectional;
  }

  /**
   * Update edge display settings
   */
  public updateDisplaySettings(settings: Partial<NonNullable<EdgeData['displaySettings']>>): void {
    this.displaySettings = {
      ...this.displaySettings,
      ...settings,
    };
  }

  /**
   * Check if this edge connects the given nodes (in either direction)
   */
  public connectsNodes(nodeId1: string, nodeId2: string): boolean {
    return (this.sourceId === nodeId1 && this.targetId === nodeId2) ||
           (this.isBidirectional && this.sourceId === nodeId2 && this.targetId === nodeId1);
  }

  /**
   * Returns the opposite node ID given one node of the edge
   */
  public getOppositeNodeId(nodeId: string): string | null {
    if (this.sourceId === nodeId) return this.targetId;
    if (this.targetId === nodeId) return this.sourceId;
    return null;
  }

  /**
   * Creates a simplified representation of the edge for serialization
   */
  public toJSON(): EdgeData {
    return {
      id: this.id,
      sourceId: this.sourceId,
      targetId: this.targetId,
      type: this.type,
      label: this.label,
      weight: this.weight,
      isBidirectional: this.isBidirectional,
      metadata: this.metadata,
      displaySettings: this.displaySettings,
    };
  }
} 