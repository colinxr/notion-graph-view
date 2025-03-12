import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MongoGraphRepository } from '../graph.repository';
import { GraphMapper } from '../graph.mapper';
import { GraphDocument } from '../graph.schema';
import { Graph } from '../../../../domain/models/graph.entity';
import { NodeType } from '../../../../domain/models/node.entity';
import { EdgeType } from '../../../../domain/models/edge.entity';
import { GraphTheme, LayoutAlgorithm } from '../../../../domain/models/graph-settings.value-object';

describe('MongoGraphRepository', () => {
  let repository: MongoGraphRepository;
  let graphModel: Model<GraphDocument>;
  let graphMapper: GraphMapper;

  // Create a more complete mockGraphData that matches the actual toJSON output
  const mockGraphData = {
    id: 'graph-123',
    name: 'Test Graph',
    ownerId: 'user-123',
    description: 'A test graph',
    nodes: [],
    edges: [],
    workspaceId: undefined,
    sourceDatabaseId: undefined,
    createdAt: expect.any(Date),
    updatedAt: expect.any(Date),
    isPublic: false,
    sharedWith: [],
    tags: [],
    settings: {
      layout: LayoutAlgorithm.FORCE_DIRECTED,
      visualSettings: {
        theme: GraphTheme.LIGHT,
        nodeSize: { default: 10, scaleByConnections: true, min: 5, max: 20 },
        edgeSettings: { 
          thickness: 1, 
          scaleByWeight: true, 
          style: 'solid' as 'solid' | 'dashed' | 'dotted'
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
        zoomLimits: { min: 0.1, max: 2 },
        clickBehavior: 'select' as 'select' | 'expand' | 'navigate',
        multiSelect: true,
        hideDisconnectedOnSelect: false,
        showDetailsOnHover: true,
      },
    },
  };

  // Mock graph domain entity
  const mockGraph = new Graph({
    id: 'graph-123',
    name: 'Test Graph',
    ownerId: 'user-123',
    description: 'A test graph',
    nodes: [],
    edges: [],
    settings: {
      layout: LayoutAlgorithm.FORCE_DIRECTED,
      visualSettings: {
        theme: GraphTheme.LIGHT,
        nodeSize: { default: 10, scaleByConnections: true, min: 5, max: 20 },
        edgeSettings: { 
          thickness: 1, 
          scaleByWeight: true, 
          style: 'solid' as 'solid' | 'dashed' | 'dotted'
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
        zoomLimits: { min: 0.1, max: 2 },
        clickBehavior: 'select' as 'select' | 'expand' | 'navigate',
        multiSelect: true,
        hideDisconnectedOnSelect: false,
        showDetailsOnHover: true,
      },
    },
  });

  // Mock GraphDocument
  const mockGraphDoc = {
    id: 'graph-123',
    name: 'Test Graph',
    ownerId: 'user-123',
    // ... other document data
  } as GraphDocument;

  // Setup model mock functions
  const graphModelMock = {
    findOne: jest.fn(),
    find: jest.fn(),
    findOneAndUpdate: jest.fn(),
    deleteOne: jest.fn(),
    countDocuments: jest.fn(),
  };

  // Setup mapper mock functions with toJSON for toPersistence
  const graphMapperMock = {
    toDomain: jest.fn().mockReturnValue(mockGraph),
    toPersistence: jest.fn().mockReturnValue(mockGraphData),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        MongoGraphRepository,
        {
          provide: getModelToken(GraphDocument.name),
          useValue: graphModelMock,
        },
        {
          provide: GraphMapper,
          useValue: graphMapperMock,
        },
      ],
    }).compile();

    repository = moduleRef.get<MongoGraphRepository>(MongoGraphRepository);
    graphModel = moduleRef.get<Model<GraphDocument>>(getModelToken(GraphDocument.name));
    graphMapper = moduleRef.get<GraphMapper>(GraphMapper);

    // Clear all mock calls before each test
    jest.clearAllMocks();
    
    // Set up the mock for graph.toJSON()
    jest.spyOn(mockGraph, 'toJSON').mockReturnValue(mockGraphData);
  });

  describe('findById', () => {
    it('should return a graph when found', async () => {
      // Arrange
      const id = 'graph-123';
      const mockExec = jest.fn().mockResolvedValue(mockGraphDoc);
      graphModelMock.findOne.mockReturnValue({ exec: mockExec });

      // Act
      const result = await repository.findById(id);

      // Assert
      expect(graphModel.findOne).toHaveBeenCalledWith({ id });
      expect(mockExec).toHaveBeenCalled();
      expect(graphMapper.toDomain).toHaveBeenCalledWith(mockGraphDoc);
      expect(result).toEqual(mockGraph);
    });

    it('should return null when graph is not found', async () => {
      // Arrange
      const id = 'non-existent-id';
      const mockExec = jest.fn().mockResolvedValue(null);
      graphModelMock.findOne.mockReturnValue({ exec: mockExec });

      // Act
      const result = await repository.findById(id);

      // Assert
      expect(graphModel.findOne).toHaveBeenCalledWith({ id });
      expect(mockExec).toHaveBeenCalled();
      expect(graphMapper.toDomain).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('findByOwner', () => {
    it('should return graphs owned by a user', async () => {
      // Arrange
      const ownerId = 'user-123';
      const mockGraphDocs = [mockGraphDoc, mockGraphDoc];
      const mockExec = jest.fn().mockResolvedValue(mockGraphDocs);
      graphModelMock.find.mockReturnValue({ exec: mockExec });

      // Act
      const result = await repository.findByOwner(ownerId);

      // Assert
      expect(graphModel.find).toHaveBeenCalledWith({ ownerId });
      expect(mockExec).toHaveBeenCalled();
      expect(graphMapper.toDomain).toHaveBeenCalledTimes(2);
      expect(result).toEqual([mockGraph, mockGraph]);
    });
  });

  describe('findAccessibleByUser', () => {
    it('should return graphs accessible by a user', async () => {
      // Arrange
      const userId = 'user-123';
      const mockGraphDocs = [mockGraphDoc, mockGraphDoc];
      const mockExec = jest.fn().mockResolvedValue(mockGraphDocs);
      graphModelMock.find.mockReturnValue({ exec: mockExec });

      // Act
      const result = await repository.findAccessibleByUser(userId);

      // Assert
      expect(graphModel.find).toHaveBeenCalledWith({
        $or: [
          { ownerId: userId },
          { sharedWith: userId },
          { isPublic: true },
        ],
      });
      expect(mockExec).toHaveBeenCalled();
      expect(graphMapper.toDomain).toHaveBeenCalledTimes(2);
      expect(result).toEqual([mockGraph, mockGraph]);
    });
  });

  describe('save', () => {
    it('should save a graph', async () => {
      // Arrange
      const mockExec = jest.fn().mockResolvedValue(mockGraphDoc);
      graphModelMock.findOneAndUpdate.mockReturnValue({ exec: mockExec });

      // Act
      const result = await repository.save(mockGraph);

      // Assert
      // First check if the toJSON was called
      expect(mockGraph.toJSON).toHaveBeenCalled();
      
      // Then check the findOneAndUpdate call
      expect(graphModel.findOneAndUpdate).toHaveBeenCalledWith(
        { id: mockGraph.id },
        { $set: mockGraphData },
        { upsert: true, new: true }
      );
      expect(mockExec).toHaveBeenCalled();
      expect(graphMapper.toDomain).toHaveBeenCalledWith(mockGraphDoc);
      expect(result).toEqual(mockGraph);
    });
  });

  describe('delete', () => {
    it('should delete a graph and return true when successful', async () => {
      // Arrange
      const id = 'graph-123';
      const mockExec = jest.fn().mockResolvedValue({ deletedCount: 1 });
      graphModelMock.deleteOne.mockReturnValue({ exec: mockExec });

      // Act
      const result = await repository.delete(id);

      // Assert
      expect(graphModel.deleteOne).toHaveBeenCalledWith({ id });
      expect(mockExec).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should return false when no graph is deleted', async () => {
      // Arrange
      const id = 'non-existent-id';
      const mockExec = jest.fn().mockResolvedValue({ deletedCount: 0 });
      graphModelMock.deleteOne.mockReturnValue({ exec: mockExec });

      // Act
      const result = await repository.delete(id);

      // Assert
      expect(graphModel.deleteOne).toHaveBeenCalledWith({ id });
      expect(mockExec).toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });

  describe('countByOwner', () => {
    it('should return the count of graphs owned by a user', async () => {
      // Arrange
      const ownerId = 'user-123';
      const mockExec = jest.fn().mockResolvedValue(5);
      graphModelMock.countDocuments.mockReturnValue({ exec: mockExec });

      // Act
      const result = await repository.countByOwner(ownerId);

      // Assert
      expect(graphModel.countDocuments).toHaveBeenCalledWith({ ownerId });
      expect(mockExec).toHaveBeenCalled();
      expect(result).toBe(5);
    });
  });

  // Additional tests for other repository methods could be added here...
}); 