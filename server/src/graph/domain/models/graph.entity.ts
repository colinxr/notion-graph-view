import { v4 as uuidv4 } from 'uuid';
import { Node, NodeData, NodeType } from './node.entity';
import { Edge, EdgeData, EdgeType } from './edge.entity';
import { GraphSettings, GraphSettingsData } from './graph-settings.value-object';

/**
 * Interface for graph data
 */
export interface GraphData {
  /** Unique identifier for this graph */
  id?: string;
  
  /** Name of the graph */
  name: string;
  
  /** User ID who owns this graph */
  ownerId: string;
  
  /** Graph description */
  description?: string;
  
  /** Workspace this graph belongs to */
  workspaceId?: string;
  
  /** Source notion database ID from which this graph was generated, if applicable */
  sourceDatabaseId?: string;
  
  /** Date the graph was created */
  createdAt?: Date;
  
  /** Date the graph was last updated */
  updatedAt?: Date;
  
  /** Whether this graph is shared publicly */
  isPublic?: boolean;

  /** Users this graph is shared with */
  sharedWith?: string[];
  
  /** List of node data */
  nodes?: NodeData[];
  
  /** List of edge data */
  edges?: EdgeData[];
  
  /** Graph visualization settings */
  settings?: GraphSettingsData;
  
  /** User-defined tags for this graph */
  tags?: string[];
}

/**
 * Graph is the aggregate root for the graph visualization domain.
 * It maintains a collection of nodes and edges and manages the overall graph state.
 */
export class Graph {
  /** Unique identifier for this graph */
  public readonly id: string;
  
  /** Name of the graph */
  public name: string;
  
  /** User ID who owns this graph */
  public readonly ownerId: string;
  
  /** Graph description */
  public description: string;
  
  /** Workspace this graph belongs to */
  public readonly workspaceId?: string;
  
  /** Source notion database ID from which this graph was generated, if applicable */
  public readonly sourceDatabaseId?: string;
  
  /** Date the graph was created */
  public readonly createdAt: Date;
  
  /** Date the graph was last updated */
  public updatedAt: Date;
  
  /** Whether this graph is shared publicly */
  public isPublic: boolean;

  /** Users this graph is shared with */
  public sharedWith: string[];
  
  /** Graph visualization settings */
  public settings: GraphSettings;
  
  /** User-defined tags for this graph */
  public tags: string[];
  
  /** Collection of nodes in this graph */
  private _nodes: Map<string, Node> = new Map();
  
  /** Collection of edges in this graph */
  private _edges: Map<string, Edge> = new Map();
  
  constructor(data: GraphData) {
    this.id = data.id || uuidv4();
    this.name = data.name;
    this.ownerId = data.ownerId;
    this.description = data.description || '';
    this.workspaceId = data.workspaceId;
    this.sourceDatabaseId = data.sourceDatabaseId;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    this.isPublic = data.isPublic || false;
    this.sharedWith = data.sharedWith || [];
    this.settings = data.settings 
      ? new GraphSettings(data.settings)
      : GraphSettings.createDefault();
    this.tags = data.tags || [];
    
    // Initialize nodes and edges if provided
    if (data.nodes) {
      data.nodes.forEach(nodeData => {
        const node = new Node(nodeData);
        this._nodes.set(node.id, node);
      });
    }
    
    if (data.edges) {
      data.edges.forEach(edgeData => {
        const edge = new Edge(edgeData);
        this._edges.set(edge.id, edge);
      });
    }
  }

  /**
   * Get all nodes in the graph
   */
  public get nodes(): Node[] {
    return Array.from(this._nodes.values());
  }

  /**
   * Get all edges in the graph
   */
  public get edges(): Edge[] {
    return Array.from(this._edges.values());
  }

  /**
   * Add a node to the graph
   * @returns The added node
   */
  public addNode(nodeData: NodeData): Node {
    const node = new Node(nodeData);
    this._nodes.set(node.id, node);
    this.updatedAt = new Date();
    return node;
  }

  /**
   * Get a node by ID
   */
  public getNode(id: string): Node | undefined {
    return this._nodes.get(id);
  }

  /**
   * Remove a node from the graph along with its connected edges
   * @returns True if the node was removed, false if not found
   */
  public removeNode(id: string): boolean {
    if (!this._nodes.has(id)) {
      return false;
    }
    
    // Remove all edges connected to this node
    this._edges.forEach((edge, edgeId) => {
      if (edge.sourceId === id || edge.targetId === id) {
        this._edges.delete(edgeId);
      }
    });
    
    this._nodes.delete(id);
    this.updatedAt = new Date();
    return true;
  }

  /**
   * Add an edge to the graph
   * @returns The added edge or null if source or target nodes don't exist
   */
  public addEdge(edgeData: EdgeData): Edge | null {
    // Check if both source and target nodes exist
    if (!this._nodes.has(edgeData.sourceId) || !this._nodes.has(edgeData.targetId)) {
      return null;
    }
    
    const edge = new Edge(edgeData);
    this._edges.set(edge.id, edge);
    this.updatedAt = new Date();
    return edge;
  }

  /**
   * Get an edge by ID
   */
  public getEdge(id: string): Edge | undefined {
    return this._edges.get(id);
  }

  /**
   * Remove an edge from the graph
   * @returns True if the edge was removed, false if not found
   */
  public removeEdge(id: string): boolean {
    if (!this._edges.has(id)) {
      return false;
    }
    
    this._edges.delete(id);
    this.updatedAt = new Date();
    return true;
  }

  /**
   * Get all edges connected to a node
   */
  public getNodeEdges(nodeId: string): Edge[] {
    if (!this._nodes.has(nodeId)) {
      return [];
    }
    
    return this.edges.filter(edge => 
      edge.sourceId === nodeId || edge.targetId === nodeId
    );
  }

  /**
   * Get all nodes connected to a given node
   */
  public getConnectedNodes(nodeId: string): Node[] {
    const connectedNodeIds = new Set<string>();
    
    this.getNodeEdges(nodeId).forEach(edge => {
      if (edge.sourceId === nodeId) {
        connectedNodeIds.add(edge.targetId);
      } else {
        connectedNodeIds.add(edge.sourceId);
      }
    });
    
    return Array.from(connectedNodeIds)
      .map(id => this._nodes.get(id))
      .filter((node): node is Node => node !== undefined);
  }

  /**
   * Update graph metadata
   */
  public updateMetadata(data: Partial<Pick<GraphData, 'name' | 'description' | 'tags'>>): void {
    if (data.name !== undefined) this.name = data.name;
    if (data.description !== undefined) this.description = data.description;
    if (data.tags !== undefined) this.tags = data.tags;
    this.updatedAt = new Date();
  }

  /**
   * Update graph settings
   */
  public updateSettings(settingsData: Partial<GraphSettingsData>): void {
    this.settings = this.settings.with(settingsData);
    this.updatedAt = new Date();
  }

  /**
   * Share the graph with a user
   */
  public shareWithUser(userId: string): void {
    if (!this.sharedWith.includes(userId)) {
      this.sharedWith.push(userId);
      this.updatedAt = new Date();
    }
  }

  /**
   * Unshare the graph from a user
   */
  public unshareFromUser(userId: string): void {
    this.sharedWith = this.sharedWith.filter(id => id !== userId);
    this.updatedAt = new Date();
  }

  /**
   * Set the public visibility of the graph
   */
  public setPublicVisibility(isPublic: boolean): void {
    this.isPublic = isPublic;
    this.updatedAt = new Date();
  }

  /**
   * Clear all nodes and edges from the graph
   */
  public clear(): void {
    this._nodes.clear();
    this._edges.clear();
    this.updatedAt = new Date();
  }

  /**
   * Get the number of nodes in the graph
   */
  public get nodeCount(): number {
    return this._nodes.size;
  }

  /**
   * Get the number of edges in the graph
   */
  public get edgeCount(): number {
    return this._edges.size;
  }

  /**
   * Check if the graph is empty
   */
  public get isEmpty(): boolean {
    return this._nodes.size === 0;
  }

  /**
   * Merges another graph into this one
   */
  public mergeGraph(otherGraph: Graph): void {
    // Add all nodes from the other graph
    otherGraph.nodes.forEach(node => {
      if (!this._nodes.has(node.id)) {
        this._nodes.set(node.id, node);
      }
    });
    
    // Add all edges from the other graph
    otherGraph.edges.forEach(edge => {
      if (!this._edges.has(edge.id) && 
          this._nodes.has(edge.sourceId) && 
          this._nodes.has(edge.targetId)) {
        this._edges.set(edge.id, edge);
      }
    });
    
    this.updatedAt = new Date();
  }

  /**
   * Creates a JSON representation of the graph
   */
  public toJSON(): GraphData {
    return {
      id: this.id,
      name: this.name,
      ownerId: this.ownerId,
      description: this.description,
      workspaceId: this.workspaceId,
      sourceDatabaseId: this.sourceDatabaseId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      isPublic: this.isPublic,
      sharedWith: this.sharedWith,
      tags: this.tags,
      nodes: this.nodes.map(node => node.toJSON()),
      edges: this.edges.map(edge => edge.toJSON()),
      settings: this.settings.toJSON(),
    };
  }
} 