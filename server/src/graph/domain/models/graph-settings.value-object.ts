/**
 * Graph layout algorithms supported by the visualization
 */
export enum LayoutAlgorithm {
  FORCE_DIRECTED = 'force_directed',
  RADIAL = 'radial',
  HIERARCHICAL = 'hierarchical',
  CIRCULAR = 'circular',
  GRID = 'grid',
  CUSTOM = 'custom',
}

/**
 * Theme options for graph visualization
 */
export enum GraphTheme {
  LIGHT = 'light',
  DARK = 'dark',
  NOTION = 'notion',
  CUSTOM = 'custom',
}

/**
 * Settings for how node relationships are displayed
 */
export interface RelationshipSettings {
  /** Show parent-child relationships */
  showParentChild: boolean;
  /** Show database relationships */
  showDatabaseRelations: boolean;
  /** Show backlinks */
  showBacklinks: boolean;
  /** Show bidirectional links differently */
  highlightBidirectionalLinks: boolean;
  /** Maximum relationship distance to show from focus node */
  maxDistance?: number;
}

/**
 * Settings for physics simulation in force-directed layouts
 */
export interface PhysicsSettings {
  /** Strength of attraction between connected nodes */
  gravitationalConstant: number;
  /** Strength of repulsion between all nodes */
  springConstant: number;
  /** Length of edges in the visualization */
  springLength: number;
  /** Damping factor to stabilize the simulation */
  damping: number;
  /** Whether physics simulation is enabled */
  enabled: boolean;
}

/**
 * Filter settings for the graph
 */
export interface FilterSettings {
  /** Include pages in visualization */
  includePages: boolean;
  /** Include databases in visualization */
  includeDatabases: boolean;
  /** Minimum connection count for node inclusion */
  minConnections?: number;
  /** Date range for content to include */
  dateRange?: {
    startDate?: Date;
    endDate?: Date;
  };
  /** Search filter text */
  searchText?: string;
  /** Tags to include */
  includeTags?: string[];
  /** Tags to exclude */
  excludeTags?: string[];
  /** Only show neighboring nodes for selected nodes */
  onlyShowNeighbors: boolean;
}

/**
 * Visual styling for the graph
 */
export interface VisualSettings {
  /** Graph theme */
  theme: GraphTheme;
  /** Custom theme colors if using custom theme */
  customColors?: {
    /** Background color */
    background: string;
    /** Node default color */
    node: string;
    /** Edge default color */
    edge: string;
    /** Text color */
    text: string;
    /** Highlight color */
    highlight: string;
  };
  /** Node size settings */
  nodeSize: {
    /** Base node size */
    default: number;
    /** Scale node size based on connections */
    scaleByConnections: boolean;
    /** Minimum size for scaled nodes */
    min: number;
    /** Maximum size for scaled nodes */
    max: number;
  };
  /** Edge settings */
  edgeSettings: {
    /** Default edge thickness */
    thickness: number;
    /** Scale edge thickness based on weight */
    scaleByWeight: boolean;
    /** Default edge style */
    style: 'solid' | 'dashed' | 'dotted';
  };
  /** Whether to show node labels */
  showLabels: boolean;
  /** Whether to show node icons */
  showIcons: boolean;
  /** Enable antialiasing (better quality but more resource intensive) */
  antialiasing: boolean;
}

/**
 * Interaction settings for the graph visualization
 */
export interface InteractionSettings {
  /** Allow node dragging */
  draggable: boolean;
  /** Zoom level bounds */
  zoomLimits: {
    min: number;
    max: number;
  };
  /** Behavior when clicking nodes */
  clickBehavior: 'select' | 'expand' | 'navigate';
  /** Allow multi-select of nodes */
  multiSelect: boolean;
  /** Hide disconnected nodes on select */
  hideDisconnectedOnSelect: boolean;
  /** Show node details on hover */
  showDetailsOnHover: boolean;
}

/**
 * Interface for graph settings data
 */
export interface GraphSettingsData {
  /** Layout algorithm to use */
  layout: LayoutAlgorithm;
  /** Settings specific to each layout algorithm */
  layoutSettings?: Record<string, any>;
  /** Visual settings for the graph */
  visualSettings: VisualSettings;
  /** Relationship display settings */
  relationshipSettings: RelationshipSettings;
  /** Filter settings for nodes and edges */
  filterSettings: FilterSettings;
  /** Physics simulation settings */
  physicsSettings: PhysicsSettings;
  /** User interaction settings */
  interactionSettings: InteractionSettings;
}

/**
 * GraphSettings is a value object that encapsulates all configuration
 * for how a graph should be visualized
 */
export class GraphSettings {
  /** Layout algorithm to use */
  public readonly layout: LayoutAlgorithm;
  
  /** Settings specific to each layout algorithm */
  public readonly layoutSettings?: Record<string, any>;
  
  /** Visual settings for the graph */
  public readonly visualSettings: VisualSettings;
  
  /** Relationship display settings */
  public readonly relationshipSettings: RelationshipSettings;
  
  /** Filter settings for nodes and edges */
  public readonly filterSettings: FilterSettings;
  
  /** Physics simulation settings */
  public readonly physicsSettings: PhysicsSettings;
  
  /** User interaction settings */
  public readonly interactionSettings: InteractionSettings;

  constructor(data: GraphSettingsData) {
    this.layout = data.layout;
    this.layoutSettings = data.layoutSettings;
    this.visualSettings = data.visualSettings;
    this.relationshipSettings = data.relationshipSettings;
    this.filterSettings = data.filterSettings;
    this.physicsSettings = data.physicsSettings;
    this.interactionSettings = data.interactionSettings;
  }

  /**
   * Creates default graph settings
   */
  public static createDefault(): GraphSettings {
    return new GraphSettings({
      layout: LayoutAlgorithm.FORCE_DIRECTED,
      visualSettings: {
        theme: GraphTheme.LIGHT,
        nodeSize: {
          default: 10,
          scaleByConnections: true,
          min: 5,
          max: 20,
        },
        edgeSettings: {
          thickness: 1,
          scaleByWeight: true,
          style: 'solid',
        },
        showLabels: true,
        showIcons: true,
        antialiasing: true,
      },
      relationshipSettings: {
        showParentChild: true,
        showDatabaseRelations: true,
        showBacklinks: true,
        highlightBidirectionalLinks: true,
        maxDistance: 2,
      },
      filterSettings: {
        includePages: true,
        includeDatabases: true,
        onlyShowNeighbors: false,
      },
      physicsSettings: {
        gravitationalConstant: -50,
        springConstant: 0.08,
        springLength: 100,
        damping: 0.9,
        enabled: true,
      },
      interactionSettings: {
        draggable: true,
        zoomLimits: {
          min: 0.1,
          max: 2,
        },
        clickBehavior: 'select',
        multiSelect: true,
        hideDisconnectedOnSelect: false,
        showDetailsOnHover: true,
      },
    });
  }

  /**
   * Creates a new GraphSettings object with updated properties
   */
  public with(settings: Partial<GraphSettingsData>): GraphSettings {
    return new GraphSettings({
      layout: settings.layout ?? this.layout,
      layoutSettings: settings.layoutSettings ?? this.layoutSettings,
      visualSettings: settings.visualSettings ? {
        ...this.visualSettings,
        ...settings.visualSettings,
      } : this.visualSettings,
      relationshipSettings: settings.relationshipSettings ? {
        ...this.relationshipSettings,
        ...settings.relationshipSettings,
      } : this.relationshipSettings,
      filterSettings: settings.filterSettings ? {
        ...this.filterSettings,
        ...settings.filterSettings,
      } : this.filterSettings,
      physicsSettings: settings.physicsSettings ? {
        ...this.physicsSettings,
        ...settings.physicsSettings,
      } : this.physicsSettings,
      interactionSettings: settings.interactionSettings ? {
        ...this.interactionSettings,
        ...settings.interactionSettings,
      } : this.interactionSettings,
    });
  }

  /**
   * Creates a simplified representation of the settings for serialization
   */
  public toJSON(): GraphSettingsData {
    return {
      layout: this.layout,
      layoutSettings: this.layoutSettings,
      visualSettings: this.visualSettings,
      relationshipSettings: this.relationshipSettings,
      filterSettings: this.filterSettings,
      physicsSettings: this.physicsSettings,
      interactionSettings: this.interactionSettings,
    };
  }
} 