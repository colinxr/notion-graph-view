import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { GraphModule } from '../../../../graph.module';
import { IGraphRepository } from '../../../../domain/repositories/graph.repository.interface';
import { CreateGraphDto } from '../../../../application/dtos/graph.dto';
import { ShareGraphDto, SetPublicVisibilityDto } from '../../../../application/dtos/graph.dto';
import { mockAuthGuard } from '../../../../../test/mock/mock-auth-guard';
import { mockIamModule } from '../../../../../test/mock/mock-iam-module';
import { mockEventBusModule } from '../../../../../test/mock/mock-event-bus-module';
import { AuthGuard } from '../../../../../iam/interfaces/http/guards/auth.guard';
import { SubscriptionGuard } from '../../../../../iam/interfaces/http/guards/subscription.guard';
import { GraphService } from '../../../../application/services/graph.service';
import { Schema } from 'mongoose';
import { MongoGraphRepository } from '../../../../infrastructure/persistence/mongodb/graph.repository';
import { GraphMapper } from '../../../../infrastructure/persistence/mongodb/graph.mapper';
import { SharingController } from '../../controllers/sharing.controller';
import { GraphSharingService } from '../../../../application/services/graph-sharing.service';

/**
 * Integration tests for the SharingController
 * Uses in-memory MongoDB for testing
 */
describe('SharingController (Integration)', () => {
  let app: INestApplication;
  let graphRepository: IGraphRepository;
  let graphService: GraphService;
  let graphSharingService: GraphSharingService;
  let mongod: MongoMemoryServer;
  let testUserId = 'test-owner-id';
  let testGraphId: string;
  let secondUserId = 'test-user2-id';

  beforeAll(async () => {
    // Create an in-memory MongoDB server
    mongod = await MongoMemoryServer.create();
    const mongoUri = mongod.getUri();
    
    // Create test schemas
    const GraphSchema = new Schema({
      // Simplified schema for testing
      name: String,
      ownerId: String,
      description: String,
      isPublic: Boolean,
      sharedWith: [String],
      nodes: Array,
      edges: Array,
      settings: Object,
    });
    
    const NodeSchema = new Schema({
      // Simplified schema for testing
      notionId: String,
      title: String,
      type: String,
    });
    
    const EdgeSchema = new Schema({
      // Simplified schema for testing
      sourceId: String,
      targetId: String,
      type: String,
    });
    
    // Create a test module with actual repositories but mocked auth
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
        // Connect to the in-memory MongoDB
        MongooseModule.forRoot(mongoUri),
        // Register models explicitly
        MongooseModule.forFeature([
          { name: 'GraphDocumentModel', schema: GraphSchema },
          { name: 'Node', schema: NodeSchema },
          { name: 'Edge', schema: EdgeSchema },
        ]),
        mockIamModule,
        mockEventBusModule,
      ],
      controllers: [
        SharingController
      ],
      providers: [
        GraphService,
        GraphSharingService,
        GraphMapper,
        // Provide the repository with the correct token
        {
          provide: 'IGraphRepository',
          useClass: MongoGraphRepository,
        },
        // Mock other dependencies as needed
        {
          provide: 'IEventPublisher',
          useValue: { publish: jest.fn() },
        },
        {
          provide: 'IUserService',
          useValue: {
            findById: jest.fn().mockResolvedValue({ id: testUserId }),
            findByIds: jest.fn().mockResolvedValue([{ id: secondUserId }]),
          }
        }
      ],
    })
    .overrideGuard(AuthGuard)
    .useValue(mockAuthGuard(testUserId))
    .overrideGuard(SubscriptionGuard)
    .useValue({canActivate: () => true})
    .compile();

    app = moduleFixture.createNestApplication();
    graphRepository = moduleFixture.get<IGraphRepository>('IGraphRepository');
    graphService = moduleFixture.get<GraphService>(GraphService);
    graphSharingService = moduleFixture.get<GraphSharingService>(GraphSharingService);
    await app.init();
  });

  beforeEach(async () => {
    // Create a test graph for each test
    const graph = await graphService.createGraph(testUserId, {
      name: 'Test Sharing Graph',
      description: 'A graph for testing sharing functionality',
    });
    
    testGraphId = graph.id;
  });

  afterEach(async () => {
    // Clean up after each test
    try {
      await graphRepository.delete(testGraphId);
    } catch (e) {
      console.error('Failed to delete test graph', e);
    }
  });

  afterAll(async () => {
    await app.close();
    // Stop the in-memory MongoDB server
    await mongod.stop();
  });

  describe('Share Graph', () => {
    it('should share a graph with another user', async () => {
      const shareDto: ShareGraphDto = {
        userIds: [secondUserId],
      };

      const response = await request(app.getHttpServer())
        .post(`/graphs/${testGraphId}/share`)
        .send(shareDto)
        .expect(HttpStatus.OK);

      expect(response.body).toHaveProperty('id', testGraphId);
      expect(response.body.sharedWith).toContain(secondUserId);
    });

    it('should get users with whom a graph is shared', async () => {
      const response = await request(app.getHttpServer())
        .get(`/graphs/${testGraphId}/shared-users`)
        .expect(HttpStatus.OK);

      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBe(1);
      expect(response.body[0]).toHaveProperty('id', secondUserId);
    });

    it('should remove sharing for a user', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/graphs/${testGraphId}/share`)
        .send([secondUserId])
        .expect(HttpStatus.OK);

      expect(response.body).toHaveProperty('id', testGraphId);
      expect(response.body.sharedWith).not.toContain(secondUserId);
    });
  });

  describe('Public Visibility', () => {
    it('should set a graph to public', async () => {
      const visibilityDto: SetPublicVisibilityDto = {
        isPublic: true,
      };

      const response = await request(app.getHttpServer())
        .post(`/graphs/${testGraphId}/public`)
        .send(visibilityDto)
        .expect(HttpStatus.OK);

      expect(response.body).toHaveProperty('id', testGraphId);
      expect(response.body.isPublic).toBe(true);
    });

    it('should get public graphs', async () => {
      const response = await request(app.getHttpServer())
        .get('/graphs/public')
        .expect(HttpStatus.OK);

      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBeGreaterThan(0);
      
      // At least one of the public graphs should be our test graph
      const foundGraph = response.body.find((g: any) => g.id === testGraphId);
      expect(foundGraph).toBeDefined();
      expect(foundGraph.isPublic).toBe(true);
    });

    it('should set a graph back to private', async () => {
      const visibilityDto: SetPublicVisibilityDto = {
        isPublic: false,
      };

      const response = await request(app.getHttpServer())
        .post(`/graphs/${testGraphId}/public`)
        .send(visibilityDto)
        .expect(HttpStatus.OK);

      expect(response.body).toHaveProperty('id', testGraphId);
      expect(response.body.isPublic).toBe(false);
    });
  });
}); 