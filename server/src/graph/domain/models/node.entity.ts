import { v4 as uuidv4 } from 'uuid';

export enum NodeType {
  PAGE = 'page',
  DATABASE = 'database',
  EXTERNAL = 'external',
}

export interface NodePosition {
  x: number;
  y: number;
}

export interface NodeData {
  /** Unique identifier for this node */
  id?: string;
  
  /** Reference to the original Notion ID (page or database ID) */
  notionId: string;
  
  /** Node title for display */
  title: string;
  
  /** Type of node (page, database, external) */
  type: NodeType;
  
  /** URL to node icon */
  icon?: string;
  
  /** Custom position (if manually placed by user) */
  position?: NodePosition;
  
  /** Node metadata for display purposes */
  metadata?: {
    /** Brief content snippet or description */
    description?: string;
    /** Last time this content was modified */
    lastModified?: Date;
    /** Tags associated with this node */
    tags?: string[];
    /** Any custom properties from Notion */
    properties?: Record<string, any>;
  };
  
  /** Whether node is pinned in the visualization */
  isPinned?: boolean;
  
  /** Tracks if this node has been expanded in the visualization */
  isExpanded?: boolean;
  
  /** Custom display settings */
  displaySettings?: {
    /** Node size in the visualization */
    size?: number;
    /** Node color */
    color?: string;
    /** Custom CSS class */
    className?: string;
  };
}

/**
 * Node entity represents a vertex in the graph visualization, 
 * typically corresponding to a Notion page or database
 */
export class Node {
  /** Unique identifier for this node */
  public readonly id: string;
  
  /** Reference to the original Notion ID (page or database ID) */
  public readonly notionId: string;
  
  /** Node title for display */
  public title: string;
  
  /** Type of node (page, database, external) */
  public readonly type: NodeType;
  
  /** URL to node icon */
  public icon?: string;
  
  /** Custom position (if manually placed by user) */
  public position?: NodePosition;
  
  /** Node metadata for display purposes */
  public metadata?: {
    /** Brief content snippet or description */
    description?: string;
    /** Last time this content was modified */
    lastModified?: Date;
    /** Tags associated with this node */
    tags?: string[];
    /** Any custom properties from Notion */
    properties?: Record<string, any>;
  };
  
  /** Whether node is pinned in the visualization */
  public isPinned: boolean;
  
  /** Tracks if this node has been expanded in the visualization */
  public isExpanded: boolean;
  
  /** Custom display settings */
  public displaySettings?: {
    /** Node size in the visualization */
    size?: number;
    /** Node color */
    color?: string;
    /** Custom CSS class */
    className?: string;
  };

  constructor(data: NodeData) {
    this.id = data.id || uuidv4();
    this.notionId = data.notionId;
    this.title = data.title;
    this.type = data.type;
    this.icon = data.icon;
    this.position = data.position;
    this.metadata = data.metadata;
    this.isPinned = data.isPinned || false;
    this.isExpanded = data.isExpanded || false;
    this.displaySettings = data.displaySettings;
  }

  /**
   * Update the node's position in the visualization
   */
  public updatePosition(x: number, y: number): void {
    this.position = { x, y };
  }

  /**
   * Toggle the pinned state of this node
   */
  public togglePin(): void {
    this.isPinned = !this.isPinned;
  }

  /**
   * Toggle the expanded state of this node
   */
  public toggleExpanded(): void {
    this.isExpanded = !this.isExpanded;
  }

  /**
   * Update node display settings
   */
  public updateDisplaySettings(settings: Partial<NonNullable<NodeData['displaySettings']>>): void {
    this.displaySettings = {
      ...this.displaySettings,
      ...settings,
    };
  }

  /**
   * Updates node title
   */
  public updateTitle(title: string): void {
    this.title = title;
  }

  /**
   * Creates a simplified representation of the node for serialization
   */
  public toJSON(): NodeData {
    return {
      id: this.id,
      notionId: this.notionId,
      title: this.title,
      type: this.type,
      icon: this.icon,
      position: this.position,
      metadata: this.metadata,
      isPinned: this.isPinned,
      isExpanded: this.isExpanded,
      displaySettings: this.displaySettings,
    };
  }
} 