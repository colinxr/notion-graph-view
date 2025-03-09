import { Test } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, connect, Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { MongoGraphRepository } from '../graph.repository';
import { GraphMapper } from '../graph.mapper';
import { GraphDocument, GraphSchema } from '../graph.schema';
import { Graph } from '../../../../domain/models/graph.entity';
import { NodeType } from '../../../../domain/models/node.entity';
import { EdgeType } from '../../../../domain/models/edge.entity';
import { GraphSettings, LayoutAlgorithm, GraphTheme } from '../../../../domain/models/graph-settings.value-object';

describe('MongoGraphRepository (Integration)', () => {
  let repository: MongoGraphRepository;
  let mapper: GraphMapper;
  let graphModel: Model<GraphDocument>;
  let mongoServer: MongoMemoryServer;
  let mongoConnection: Connection;
  let uri: string;

  beforeAll(async () => {
    // Start MongoDB memory server
    mongoServer = await MongoMemoryServer.create();
    uri = mongoServer.getUri();
    mongoConnection = (await connect(uri)).connection;
  });

  afterAll(async () => {
    // Stop MongoDB memory server
    await mongoConnection.close();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // Create a testing module with real MongoDB connection
    const moduleRef = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(uri),
        MongooseModule.forFeature([
          { name: GraphDocument.name, schema: GraphSchema }
        ]),
      ],
      providers: [
        GraphMapper,
        MongoGraphRepository,
      ],
    }).compile();

    repository = moduleRef.get<MongoGraphRepository>(MongoGraphRepository);
    mapper = moduleRef.get<GraphMapper>(GraphMapper);
    graphModel = moduleRef.get<Model<GraphDocument>>(getModelToken(GraphDocument.name));

    // Clear database before each test
    await graphModel.deleteMany({});
  });

  describe('save and findById', () => {
    it('should save a graph and retrieve it by ID', async () => {
      // Arrange
      const graph = createTestGraph();
      
      // Act
      const savedGraph = await repository.save(graph);
      const retrievedGraph = await repository.findById(graph.id);
      
      // Assert
      expect(savedGraph).toBeDefined();
      expect(retrievedGraph).toBeDefined();
      expect(retrievedGraph?.id).toBe(graph.id);
      expect(retrievedGraph?.name).toBe(graph.name);
      expect(retrievedGraph?.ownerId).toBe(graph.ownerId);
      expect(retrievedGraph?.nodes.length).toBe(graph.nodes.length);
      expect(retrievedGraph?.edges.length).toBe(graph.edges.length);
    });
  });

  describe('findByOwner', () => {
    it('should find graphs by owner', async () => {
      // Arrange
      const ownerId = 'test-user-123';
      const graph1 = createTestGraph({ id: 'graph-1', ownerId });
      const graph2 = createTestGraph({ id: 'graph-2', ownerId });
      const graph3 = createTestGraph({ id: 'graph-3', ownerId: 'other-user' });
      
      await Promise.all([
        repository.save(graph1),
        repository.save(graph2),
        repository.save(graph3),
      ]);
      
      // Act
      const ownerGraphs = await repository.findByOwner(ownerId);
      
      // Assert
      expect(ownerGraphs).toBeDefined();
      expect(ownerGraphs.length).toBe(2);
      expect(ownerGraphs.map(g => g.id).sort()).toEqual(['graph-1', 'graph-2'].sort());
    });
  });

  describe('findAccessibleByUser', () => {
    it('should find graphs accessible by a user (owned, shared, or public)', async () => {
      // Arrange
      const userId = 'test-user-123';
      const otherUserId = 'other-user';
      
      // Owned by the user
      const graph1 = createTestGraph({ id: 'graph-1', ownerId: userId });
      
      // Shared with the user
      const graph2 = createTestGraph({ 
        id: 'graph-2', 
        ownerId: otherUserId,
        sharedWith: [userId, 'another-user'],
      });
      
      // Public graph
      const graph3 = createTestGraph({ 
        id: 'graph-3', 
        ownerId: otherUserId,
        isPublic: true,
      });
      
      // Not accessible by the user
      const graph4 = createTestGraph({ 
        id: 'graph-4', 
        ownerId: otherUserId,
        isPublic: false,
      });
      
      await Promise.all([
        repository.save(graph1),
        repository.save(graph2),
        repository.save(graph3),
        repository.save(graph4),
      ]);
      
      // Act
      const accessibleGraphs = await repository.findAccessibleByUser(userId);
      
      // Assert
      expect(accessibleGraphs).toBeDefined();
      expect(accessibleGraphs.length).toBe(3);
      expect(accessibleGraphs.map(g => g.id).sort()).toEqual(['graph-1', 'graph-2', 'graph-3'].sort());
    });
  });

  describe('delete', () => {
    it('should delete a graph', async () => {
      // Arrange
      const graph = createTestGraph();
      await repository.save(graph);
      
      // Verify graph exists
      const savedGraph = await repository.findById(graph.id);
      expect(savedGraph).toBeDefined();
      
      // Act
      const deleteResult = await repository.delete(graph.id);
      
      // Assert
      expect(deleteResult).toBe(true);
      
      // Verify graph no longer exists
      const deletedGraph = await repository.findById(graph.id);
      expect(deletedGraph).toBeNull();
    });

    it('should return false when deleting non-existent graph', async () => {
      // Act
      const deleteResult = await repository.delete('non-existent-id');
      
      // Assert
      expect(deleteResult).toBe(false);
    });
  });

  describe('countByOwner', () => {
    it('should count graphs by owner', async () => {
      // Arrange
      const ownerId = 'test-user-123';
      const graph1 = createTestGraph({ id: 'graph-1', ownerId });
      const graph2 = createTestGraph({ id: 'graph-2', ownerId });
      const graph3 = createTestGraph({ id: 'graph-3', ownerId: 'other-user' });
      
      await Promise.all([
        repository.save(graph1),
        repository.save(graph2),
        repository.save(graph3),
      ]);
      
      // Act
      const count = await repository.countByOwner(ownerId);
      
      // Assert
      expect(count).toBe(2);
    });
  });
});

// Helper function to create test graphs
function createTestGraph(overrides: Partial<{
  id: string;
  name: string;
  ownerId: string;
  description: string;
  isPublic: boolean;
  sharedWith: string[];
}> = {}): Graph {
  return new Graph({
    id: overrides.id || 'test-graph-id',
    name: overrides.name || 'Test Graph',
    ownerId: overrides.ownerId || 'test-user-123',
    description: overrides.description || 'Test graph description',
    isPublic: overrides.isPublic !== undefined ? overrides.isPublic : false,
    sharedWith: overrides.sharedWith || [],
    nodes: [
      {
        id: 'node-1',
        notionId: 'notion-page-1',
        title: 'Node 1',
        type: NodeType.PAGE,
      },
      {
        id: 'node-2',
        notionId: 'notion-page-2',
        title: 'Node 2',
        type: NodeType.PAGE,
      },
    ],
    edges: [
      {
        id: 'edge-1',
        sourceId: 'node-1',
        targetId: 'node-2',
        type: EdgeType.REFERENCE,
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