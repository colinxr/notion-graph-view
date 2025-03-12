import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { IGraphRepository } from '../../../../domain/repositories/graph.repository.interface';
import { UpdateGraphDto } from '../../../../application/dtos/graph.dto';
import { CreateNodeDto } from '../../../../application/dtos/node.dto';
import { CreateEdgeDto } from '../../../../application/dtos/edge.dto';
import { mockAuthGuard } from '../../../../../test/mock/mock-auth-guard';
import { mockIamModule } from '../../../../../test/mock/mock-iam-module';
import { mockEventBusModule } from '../../../../../test/mock/mock-event-bus-module';
import { AuthGuard } from '../../../../../iam/interfaces/http/guards/auth.guard';
import { SubscriptionGuard } from '../../../../../iam/interfaces/http/guards/subscription.guard';
import { NodeType } from '../../../../domain/models/node.entity';
import { EdgeType } from '../../../../domain/models/edge.entity';
import { Schema, Model } from 'mongoose';
import { MongoGraphRepository } from '../../../../infrastructure/persistence/mongodb/graph.repository';
import { GraphMapper } from '../../../../infrastructure/persistence/mongodb/graph.mapper';
import { GraphService } from '../../../../application/services/graph.service';
import { GraphController } from '../../controllers/graph.controller';
import { GraphGeneratorService } from '../../../../application/services/graph-generator.service';
import { GraphSchema, GraphDocument } from '../../../../infrastructure/persistence/mongodb/graph.schema';
import { GraphSettings } from '../../../../domain/models/graph-settings.value-object';
import { v4 as uuidv4 } from 'uuid';
import { MongoClient } from 'mongodb';

/**
 * Integration tests for GraphController
 * Uses in-memory MongoDB for testing
 */
async function createTestGraph(
  model: Model<GraphDocument>, 
  userId: string, 
  overrides = {}
): Promise<string> {
  const defaultSettings = GraphSettings.createDefault().toJSON();
  const graphId = uuidv4();
  
  const graphData = {
    id: graphId,
    name: 'Test Integration Graph',
    description: 'A graph for integration testing',
    ownerId: userId,
    settings: defaultSettings,
    nodes: [],
    edges: [],
    isPublic: false,
    sharedWith: [],
    tags: [],
    ...overrides
  };

  await model.create(graphData);
  return graphId;
}

async function clearDatabase(mongod: MongoMemoryServer) {
  const uri = mongod.getUri();
  const client = await MongoClient.connect(uri);
  const db = client.db();
  await db.collection('graphs').deleteMany({});
  await client.close();
}

describe('GraphController (Integration)', () => {
  let app: INestApplication;
  let graphRepository: IGraphRepository;
  let graphModel: Model<GraphDocument>;
  let testUserId = 'test-user-id';
  let testGraphId: string;
  let mongod: MongoMemoryServer;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const mongoUri = mongod.getUri();
    
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
        MongooseModule.forRoot(mongoUri),
        MongooseModule.forFeature([
          { name: GraphDocument.name, schema: GraphSchema },
        ]),
        mockIamModule,
        mockEventBusModule,
      ],
      controllers: [
        GraphController
      ],
      providers: [
        GraphService,
        GraphGeneratorService,
        GraphMapper,
        {
          provide: 'IGraphRepository',
          useClass: MongoGraphRepository,
        },
        {
          provide: 'IEventPublisher',
          useValue: { publish: jest.fn() },
        },
        {
          provide: 'INotionDatabaseRepository',
          useValue: {
            findById: jest.fn().mockResolvedValue({
              id: 'test-db-id',
              title: 'Test Database',
              icon: null,
              description: '',
              lastModified: new Date()
            })
          }
        },
        {
          provide: 'INotionPageRepository',
          useValue: { 
            findByDatabaseId: jest.fn().mockResolvedValue([]),
            findById: jest.fn().mockResolvedValue({
              id: 'test-page-id',
              title: 'Test Page',
              icon: null,
              description: '',
              lastModified: new Date()
            }),
            findWithBacklinks: jest.fn().mockResolvedValue([])
          },
        },
        {
          provide: 'BacklinkExtractorService',
          useValue: {
            extractBacklinksForPage: jest.fn().mockResolvedValue([])
          }
        },
        {
          provide: 'IUserService',
          useValue: {
            findById: jest.fn().mockResolvedValue({ id: testUserId }),
            findByIds: jest.fn().mockResolvedValue([{ id: testUserId }]),
          }
        },
      ],
    })
    .overrideGuard(AuthGuard)
    .useValue(mockAuthGuard(testUserId))
    .overrideGuard(SubscriptionGuard)
    .useValue({canActivate: () => true})
    .compile();

    app = moduleFixture.createNestApplication();
    graphRepository = moduleFixture.get<IGraphRepository>('IGraphRepository');
    graphModel = moduleFixture.get<Model<GraphDocument>>(getModelToken(GraphDocument.name));
    await app.init();
  });

  afterEach(async () => {
    await clearDatabase(mongod);
  });

  afterAll(async () => {
    await clearDatabase(mongod);
    if (app) {
      await app.close();
    }
    if (mongod) {
      await mongod.stop();
    }
  });

  describe('Create and Retrieve Graphs', () => {
    it('should create a new graph', async () => {
      const graphId = await createTestGraph(graphModel, testUserId);
      expect(graphId).toBeDefined();

      const response = await request(app.getHttpServer())
        .get(`/graphs/${graphId}`)
        .expect(HttpStatus.OK);

      expect(response.body).toHaveProperty('id', graphId);
      expect(response.body.name).toBe('Test Integration Graph');
      expect(response.body.ownerId).toBe(testUserId);
    });

    it('should get all owned graphs', async () => {
      // Create multiple graphs
      await createTestGraph(graphModel, testUserId, { name: 'Graph 1' });
      await createTestGraph(graphModel, testUserId, { name: 'Graph 2' });

      const response = await request(app.getHttpServer())
        .get('/graphs?owned=true')
        .expect(HttpStatus.OK);

      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBe(2);
      expect(response.body[0].ownerId).toBe(testUserId);
    });

    it('should get a specific graph by ID', async () => {
      const graphId = await createTestGraph(graphModel, testUserId);

      const response = await request(app.getHttpServer())
        .get(`/graphs/${graphId}`)
        .expect(HttpStatus.OK);

      expect(response.body).toHaveProperty('id', graphId);
      expect(response.body.name).toBe('Test Integration Graph');
      expect(response.body.ownerId).toBe(testUserId);
    });
  });

  describe('Update Graphs', () => {
    it('should update a graph', async () => {
      const graphId = await createTestGraph(graphModel, testUserId);
      
      const updateGraphDto: UpdateGraphDto = {
        name: 'Updated Test Graph',
        description: 'Updated description',
      };

      const response = await request(app.getHttpServer())
        .put(`/graphs/${graphId}`)
        .send(updateGraphDto)
        .expect(HttpStatus.OK);

      expect(response.body).toHaveProperty('id', graphId);
      expect(response.body.name).toBe(updateGraphDto.name);
      expect(response.body.description).toBe(updateGraphDto.description);
    });
  });

  describe('Manage Nodes and Edges', () => {
    let graphId: string;
    let testNodeId1: string;
    let testNodeId2: string;

    beforeEach(async () => {
      // Create a fresh graph for each test
      graphId = await createTestGraph(graphModel, testUserId);
    });

    // Helper function to create test nodes
    async function createTestNodes() {
      // Create first node
      const createNodeDto1: CreateNodeDto = {
        notionId: 'test-notion-id-1',
        title: 'Test Node 1',
        type: NodeType.PAGE
      };

      const response1 = await request(app.getHttpServer())
        .post(`/graphs/${graphId}/nodes`)
        .send(createNodeDto1)
        .expect(HttpStatus.CREATED);

      testNodeId1 = response1.body.nodes[0].id;

      // Create second node
      const createNodeDto2: CreateNodeDto = {
        notionId: 'test-notion-id-2',
        title: 'Test Node 2',
        type: NodeType.DATABASE
      };

      const response2 = await request(app.getHttpServer())
        .post(`/graphs/${graphId}/nodes`)
        .send(createNodeDto2)
        .expect(HttpStatus.CREATED);

      testNodeId2 = response2.body.nodes[1].id;

      return { response1, response2 };
    }

    it('should add nodes to a graph', async () => {
      const { response1, response2 } = await createTestNodes();

      expect(response1.body.nodes).toHaveLength(1);
      expect(response1.body.nodes[0].title).toBe('Test Node 1');
      
      expect(response2.body.nodes).toHaveLength(2);
      expect(response2.body.nodes[1].title).toBe('Test Node 2');
    });

    describe('Edge Operations', () => {
      beforeEach(async () => {
        // Create nodes before testing edges
        await createTestNodes();
      });

      it('should add an edge between nodes', async () => {
        const createEdgeDto: CreateEdgeDto = {
          sourceId: testNodeId1,
          targetId: testNodeId2,
          type: EdgeType.PARENT_CHILD,
          label: 'Test Relation',
        };

        const response = await request(app.getHttpServer())
          .post(`/graphs/${graphId}/edges`)
          .send(createEdgeDto)
          .expect(HttpStatus.CREATED);

        expect(response.body.edges).toHaveLength(1);
        expect(response.body.edges[0].sourceId).toBe(testNodeId1);
        expect(response.body.edges[0].targetId).toBe(testNodeId2);
        expect(response.body.edges[0].type).toBe(createEdgeDto.type);
      });

      it('should remove a node with connected edges', async () => {
        // First create an edge
        const createEdgeDto: CreateEdgeDto = {
          sourceId: testNodeId1,
          targetId: testNodeId2,
          type: EdgeType.PARENT_CHILD,
          label: 'Test Relation',
        };

        await request(app.getHttpServer())
          .post(`/graphs/${graphId}/edges`)
          .send(createEdgeDto)
          .expect(HttpStatus.CREATED);

        // Then remove the node
        const response = await request(app.getHttpServer())
          .delete(`/graphs/${graphId}/nodes/${testNodeId1}`)
          .expect(HttpStatus.OK);

        expect(response.body.nodes).toHaveLength(1);
        expect(response.body.edges).toHaveLength(0);
      });
    });
  });

  describe('Delete Graphs', () => {
    it('should delete a graph', async () => {
      const graphId = await createTestGraph(graphModel, testUserId);

      await request(app.getHttpServer())
        .delete(`/graphs/${graphId}`)
        .expect(HttpStatus.NO_CONTENT);

      await request(app.getHttpServer())
        .get(`/graphs/${graphId}`)
        .expect(HttpStatus.NOT_FOUND);
    });
  });
}); 