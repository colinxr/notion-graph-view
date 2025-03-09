import { Test } from '@nestjs/testing';
import { GraphMapper } from '../graph.mapper';
import { GraphDocument } from '../graph.schema';
import { Graph } from '../../../../domain/models/graph.entity';
import { NodeType } from '../../../../domain/models/node.entity';
import { EdgeType } from '../../../../domain/models/edge.entity';
import { GraphTheme, LayoutAlgorithm } from '../../../../domain/models/graph-settings.value-object';

describe('GraphMapper', () => {
  let mapper: GraphMapper;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [GraphMapper],
    }).compile();

    mapper = moduleRef.get<GraphMapper>(GraphMapper);
  });

  describe('toDomain', () => {
    it('should map a GraphDocument to a Graph domain entity', () => {
      // Arrange: Create a mock GraphDocument
      const mockGraphDoc = createMockGraphDocument();
      
      // Act: Map the document to a domain entity
      const result = mapper.toDomain(mockGraphDoc as any);
      
      // Assert: Verify the result is a Graph instance with correct properties
      expect(result).toBeInstanceOf(Graph);
      expect(result.id).toBe('graph-123');
      expect(result.name).toBe('Test Graph');
      expect(result.ownerId).toBe('user-123');
      expect(result.description).toBe('A test graph');
      expect(result.isPublic).toBe(false);
      expect(result.nodes.length).toBe(2);
      expect(result.edges.length).toBe(1);
    });

    it('should correctly map complex nested properties', () => {
      // Arrange
      const mockGraphDoc = createMockGraphDocument();
      
      // Act
      const result = mapper.toDomain(mockGraphDoc as any);
      
      // Assert: Verify nested objects are mapped correctly
      
      // Check nodes
      const firstNode = result.nodes[0];
      expect(firstNode.notionId).toBe('notion-page-123');
      expect(firstNode.title).toBe('Page 1');
      expect(firstNode.type).toBe(NodeType.PAGE);
      expect(firstNode.position).toEqual({ x: 100, y: 200 });
      expect(firstNode.metadata?.description).toBe('Test page');
      
      // Check edges
      const edge = result.edges[0];
      expect(edge.sourceId).toBe('node-123');
      expect(edge.targetId).toBe('node-456');
      expect(edge.type).toBe(EdgeType.REFERENCE);
      expect(edge.weight).toBe(1);
      expect(edge.isBidirectional).toBe(false);
      
      // Check settings
      expect(result.settings.layout).toBe(LayoutAlgorithm.FORCE_DIRECTED);
      expect(result.settings.visualSettings.theme).toBe(GraphTheme.LIGHT);
      expect(result.settings.relationshipSettings.showBacklinks).toBe(true);
    });
  });

  describe('toPersistence', () => {
    it('should map a Graph domain entity to a persistence format', () => {
      // Arrange: Create a Graph domain entity
      const graph = createTestGraph();
      
      // Act: Map to persistence format
      const result = mapper.toPersistence(graph);
      
      // Assert: Check that the result has the correct structure
      expect(result.id).toBe('graph-123');
      expect(result.name).toBe('Test Graph');
      expect(result.ownerId).toBe('user-123');
      expect(result.nodes.length).toBe(2);
      expect(result.edges.length).toBe(1);
    });
  });
});

// Helper functions to create test data

function createMockGraphDocument(): Partial<GraphDocument> {
  return {
    id: 'graph-123',
    name: 'Test Graph',
    ownerId: 'user-123',
    description: 'A test graph',
    workspaceId: 'workspace-123',
    sourceDatabaseId: 'database-123',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-02'),
    isPublic: false,
    sharedWith: ['user-456'],
    tags: ['test', 'graph'],
    nodes: [
      {
        id: 'node-123',
        notionId: 'notion-page-123',
        title: 'Page 1',
        type: NodeType.PAGE,
        icon: 'icon-url',
        position: { x: 100, y: 200 },
        metadata: {
          description: 'Test page',
          lastModified: new Date('2023-01-01'),
          tags: ['test'],
          properties: { key: 'value' },
        },
        isPinned: true,
        isExpanded: false,
        displaySettings: {
          size: 20,
          color: '#ff0000',
          className: 'test-node',
        },
      },
      {
        id: 'node-456',
        notionId: 'notion-page-456',
        title: 'Page 2',
        type: NodeType.PAGE,
        isPinned: false,
        isExpanded: true,
      },
    ],
    edges: [
      {
        id: 'edge-123',
        sourceId: 'node-123',
        targetId: 'node-456',
        type: EdgeType.REFERENCE,
        label: 'References',
        weight: 1,
        isBidirectional: false,
        metadata: {
          createdAt: new Date('2023-01-01'),
          context: 'Link context',
        },
      },
    ],
    settings: {
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
    },
    toObject: function() {
      return this;
    }
  };
}

function createTestGraph(): Graph {
  return new Graph({
    id: 'graph-123',
    name: 'Test Graph',
    ownerId: 'user-123',
    description: 'A test graph',
    workspaceId: 'workspace-123',
    sourceDatabaseId: 'database-123',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-02'),
    isPublic: false,
    sharedWith: ['user-456'],
    tags: ['test', 'graph'],
    nodes: [
      {
        id: 'node-123',
        notionId: 'notion-page-123',
        title: 'Page 1',
        type: NodeType.PAGE,
        icon: 'icon-url',
        position: { x: 100, y: 200 },
        metadata: {
          description: 'Test page',
          lastModified: new Date('2023-01-01'),
          tags: ['test'],
          properties: { key: 'value' },
        },
        isPinned: true,
        isExpanded: false,
        displaySettings: {
          size: 20,
          color: '#ff0000',
          className: 'test-node',
        },
      },
      {
        id: 'node-456',
        notionId: 'notion-page-456',
        title: 'Page 2',
        type: NodeType.PAGE,
        isPinned: false,
        isExpanded: true,
      },
    ],
    edges: [
      {
        id: 'edge-123',
        sourceId: 'node-123',
        targetId: 'node-456',
        type: EdgeType.REFERENCE,
        label: 'References',
        weight: 1,
        isBidirectional: false,
        metadata: {
          createdAt: new Date('2023-01-01'),
          context: 'Link context',
        },
      },
    ],
    settings: {
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
    },
  });
} 