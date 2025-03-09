import { Injectable } from '@nestjs/common';
import { GraphDocument, NodeDocument, EdgeDocument } from './graph.schema';
import { Graph, GraphData } from '../../../domain/models/graph.entity';
import { 
  Node, 
  NodeData, 
  NodeType 
} from '../../../domain/models/node.entity';
import { 
  Edge, 
  EdgeData, 
  EdgeType 
} from '../../../domain/models/edge.entity';
import { 
  GraphSettings, 
  GraphSettingsData,
  LayoutAlgorithm,
  GraphTheme
} from '../../../domain/models/graph-settings.value-object';

/**
 * Mapper to transform between domain models and persistence models
 */
@Injectable()
export class GraphMapper {
  /**
   * Maps a database document to a domain model
   */
  toDomain(document: GraphDocument): Graph {
    // First convert the document to a plain object (removes Mongoose-specific properties)
    const plainDoc = document.toObject();
    
    // Then map it to GraphData
    const graphData: GraphData = {
      id: plainDoc.id,
      name: plainDoc.name,
      ownerId: plainDoc.ownerId,
      description: plainDoc.description,
      workspaceId: plainDoc.workspaceId,
      sourceDatabaseId: plainDoc.sourceDatabaseId,
      createdAt: plainDoc.createdAt,
      updatedAt: plainDoc.updatedAt,
      isPublic: plainDoc.isPublic,
      sharedWith: plainDoc.sharedWith,
      tags: plainDoc.tags,
      nodes: plainDoc.nodes.map((nodeDoc: NodeDocument) => this.mapNodeDocumentToData(nodeDoc)),
      edges: plainDoc.edges.map((edgeDoc: EdgeDocument) => this.mapEdgeDocumentToData(edgeDoc)),
      settings: this.mapSettingsDocumentToData(plainDoc.settings),
    };
    
    return new Graph(graphData);
  }

  /**
   * Maps a node document to node data
   */
  private mapNodeDocumentToData(nodeDoc: NodeDocument): NodeData {
    return {
      id: nodeDoc.id,
      notionId: nodeDoc.notionId,
      title: nodeDoc.title,
      type: nodeDoc.type as NodeType,
      icon: nodeDoc.icon,
      position: nodeDoc.position,
      metadata: nodeDoc.metadata,
      isPinned: nodeDoc.isPinned,
      isExpanded: nodeDoc.isExpanded,
      displaySettings: nodeDoc.displaySettings,
    };
  }

  /**
   * Maps an edge document to edge data
   */
  private mapEdgeDocumentToData(edgeDoc: EdgeDocument): EdgeData {
    return {
      id: edgeDoc.id,
      sourceId: edgeDoc.sourceId,
      targetId: edgeDoc.targetId,
      type: edgeDoc.type as EdgeType,
      label: edgeDoc.label,
      weight: edgeDoc.weight,
      isBidirectional: edgeDoc.isBidirectional,
      metadata: edgeDoc.metadata,
      displaySettings: edgeDoc.displaySettings,
    };
  }

  /**
   * Maps settings document to settings data
   */
  private mapSettingsDocumentToData(settingsDoc: any): GraphSettingsData {
    return {
      layout: settingsDoc.layout as LayoutAlgorithm,
      layoutSettings: settingsDoc.layoutSettings,
      visualSettings: settingsDoc.visualSettings,
      relationshipSettings: settingsDoc.relationshipSettings,
      filterSettings: settingsDoc.filterSettings,
      physicsSettings: settingsDoc.physicsSettings,
      interactionSettings: settingsDoc.interactionSettings,
    };
  }

  /**
   * Maps a domain entity to a persistence model
   * Note: This isn't used directly since we're using the toJSON() methods on our domain entities,
   * but it's included for completeness and might be useful in future refactoring.
   */
  toPersistence(graph: Graph): any {
    // Use the Graph entity's toJSON method to get a plain object representation
    const graphData = graph.toJSON();
    
    // Return the data as is - MongoDB will handle the conversion to document schema
    return graphData;
  }
} 