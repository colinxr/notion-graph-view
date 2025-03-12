import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, NotFoundException } from '@nestjs/common';
import { GraphController } from '../graph.controller';
import { GraphService } from '../../../../application/services/graph.service';
import { GraphGeneratorService } from '../../../../application/services/graph-generator.service';
import { CreateGraphDto, UpdateGraphDto, GraphResponseDto, GraphSummaryResponseDto } from '../../../../application/dtos/graph.dto';
import { CreateNodeDto, UpdateNodeDto } from '../../../../application/dtos/node.dto';
import { CreateEdgeDto, UpdateEdgeDto } from '../../../../application/dtos/edge.dto';
import { GraphTheme, LayoutAlgorithm } from '../../../../domain/models/graph-settings.value-object';
import { NodeType } from '../../../../domain/models/node.entity';
import { EdgeType } from '../../../../domain/models/edge.entity';
import { AuthGuard } from '../../../../../iam/interfaces/http/guards/auth.guard';
import { SubscriptionGuard } from '../../../../../iam/interfaces/http/guards/subscription.guard';

describe('GraphController', () => {
  let controller: GraphController;
  let graphService: GraphService;
  let graphGeneratorService: GraphGeneratorService;

  const mockGraphResponseDto: GraphResponseDto = {
    id: 'graph1',
    name: 'Test Graph',
    description: 'A test graph',
    ownerId: 'user1',
    createdAt: new Date(),
    updatedAt: new Date(),
    isPublic: false,
    sharedWith: ['user2', 'user3'],
    tags: [],
    nodes: [],
    edges: [],
    settings: {
      layout: LayoutAlgorithm.FORCE_DIRECTED,
      visualSettings: { 
        theme: GraphTheme.LIGHT,
        nodeSize: {
          default: 5,
          scaleByConnections: false,
          min: 1,
          max: 10
        },
        edgeSettings: { 
          thickness: 1,
          scaleByWeight: false,
          style: 'solid'
        },
        showLabels: true,
        showIcons: true,
        antialiasing: true
      },
      relationshipSettings: {
        showParentChild: true,
        showDatabaseRelations: true,
        showBacklinks: true,
        highlightBidirectionalLinks: true
      },
      filterSettings: {
        includePages: true,
        includeDatabases: true,
        onlyShowNeighbors: false
      },
      physicsSettings: { 
        enabled: true,
        gravitationalConstant: -1000,
        springConstant: 0.08,
        springLength: 100,
        damping: 0.4
      },
      interactionSettings: {
        draggable: true,
        zoomLimits: {
          min: 0.1,
          max: 2.0
        },
        clickBehavior: 'select',
        multiSelect: false,
        hideDisconnectedOnSelect: false,
        showDetailsOnHover: true
      }
    },
  };

  const mockGraphSummaryResponseDto: GraphSummaryResponseDto = {
    id: 'graph1',
    name: 'Test Graph',
    description: 'A test graph',
    ownerId: 'user1',
    createdAt: new Date(),
    updatedAt: new Date(),
    isPublic: false,
    sharedWith: [],
    tags: [],
    nodeCount: 0,
    edgeCount: 0,
  };

  const mockGraphArray: GraphSummaryResponseDto[] = [mockGraphSummaryResponseDto];

  const mockGraph = {
    id: 'graph1',
    name: 'Test Graph',
    description: 'A test graph',
    ownerId: 'user1',
    createdAt: new Date(),
    updatedAt: new Date(),
    isPublic: false,
    sharedWith: [],
    tags: [],
    nodes: [],
    edges: [],
    settings: {
      layout: LayoutAlgorithm.FORCE_DIRECTED,
      visualSettings: { 
        theme: GraphTheme.LIGHT,
        nodeSize: {
          default: 5,
          scaleByConnections: false,
          min: 1,
          max: 10
        },
        edgeSettings: { 
          thickness: 1,
          scaleByWeight: false,
          style: 'solid'
        },
        showLabels: true,
        showIcons: true,
        antialiasing: true
      },
      relationshipSettings: {
        showParentChild: true,
        showDatabaseRelations: true,
        showBacklinks: true,
        highlightBidirectionalLinks: true
      },
      filterSettings: {
        includePages: true,
        includeDatabases: true,
        onlyShowNeighbors: false
      },
      physicsSettings: { 
        enabled: true,
        gravitationalConstant: -1000,
        springConstant: 0.08,
        springLength: 100,
        damping: 0.4
      },
      interactionSettings: {
        draggable: true,
        zoomLimits: {
          min: 0.1,
          max: 2.0
        },
        clickBehavior: 'select',
        multiSelect: false,
        hideDisconnectedOnSelect: false,
        showDetailsOnHover: true
      }
    },
    toJSON: function() {
      return {
        id: this.id,
        name: this.name,
        description: this.description,
        ownerId: this.ownerId,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
        isPublic: this.isPublic,
        sharedWith: this.sharedWith,
        tags: this.tags,
        nodes: this.nodes,
        edges: this.edges,
        settings: this.settings
      };
    }
  };

  const mockRequest = {
    user: { id: 'user1' },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GraphController],
      providers: [
        {
          provide: GraphService,
          useValue: {
            createGraph: jest.fn().mockResolvedValue(mockGraphResponseDto),
            getOwnedGraphs: jest.fn().mockResolvedValue(mockGraphArray),
            getAccessibleGraphs: jest.fn().mockResolvedValue(mockGraphArray),
            getPublicGraphs: jest.fn().mockResolvedValue(mockGraphArray),
            searchGraphs: jest.fn().mockResolvedValue(mockGraphArray),
            getGraphById: jest.fn().mockResolvedValue(mockGraphResponseDto),
            updateGraph: jest.fn().mockResolvedValue(mockGraphResponseDto),
            deleteGraph: jest.fn().mockResolvedValue(true),
            addNode: jest.fn().mockResolvedValue(mockGraphResponseDto),
            updateNode: jest.fn().mockResolvedValue(mockGraphResponseDto),
            removeNode: jest.fn().mockResolvedValue(mockGraphResponseDto),
            addEdge: jest.fn().mockResolvedValue(mockGraphResponseDto),
            updateEdge: jest.fn().mockResolvedValue(mockGraphResponseDto),
            removeEdge: jest.fn().mockResolvedValue(mockGraphResponseDto),
          },
        },
        {
          provide: GraphGeneratorService,
          useValue: {
            generateFromDatabase: jest.fn().mockResolvedValue(mockGraph),
            generateFromPage: jest.fn().mockResolvedValue(mockGraph),
            combineGraphs: jest.fn().mockResolvedValue(mockGraph),
          },
        },
      ],
    })
    .overrideGuard(AuthGuard)
    .useValue({ canActivate: () => true })
    .overrideGuard(SubscriptionGuard)
    .useValue({ canActivate: () => true })
    .compile();

    controller = module.get<GraphController>(GraphController);
    graphService = module.get<GraphService>(GraphService);
    graphGeneratorService = module.get<GraphGeneratorService>(GraphGeneratorService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createGraph', () => {
    it('should create a graph', async () => {
      const createGraphDto: CreateGraphDto = {
        name: 'Test Graph',
        description: 'A test graph',
      };

      const result = await controller.createGraph(mockRequest, createGraphDto);
      
      expect(graphService.createGraph).toHaveBeenCalledWith('user1', createGraphDto);
      expect(result).toEqual(mockGraphResponseDto);
    });
  });

  describe('getGraphs', () => {
    it('should get owned graphs when owned=true', async () => {
      const result = await controller.getGraphs(mockRequest, true);
      
      expect(graphService.getOwnedGraphs).toHaveBeenCalledWith('user1');
      expect(result).toEqual(mockGraphArray);
    });

    it('should get accessible graphs when owned is not provided', async () => {
      const result = await controller.getGraphs(mockRequest, undefined);
      
      expect(graphService.getAccessibleGraphs).toHaveBeenCalledWith('user1');
      expect(result).toEqual(mockGraphArray);
    });
  });

  describe('getPublicGraphs', () => {
    it('should get public graphs with default pagination', async () => {
      const result = await controller.getPublicGraphs();
      
      expect(graphService.getPublicGraphs).toHaveBeenCalledWith(undefined, undefined);
      expect(result).toEqual(mockGraphArray);
    });

    it('should get public graphs with custom pagination', async () => {
      const result = await controller.getPublicGraphs(10, 20);
      
      expect(graphService.getPublicGraphs).toHaveBeenCalledWith(10, 20);
      expect(result).toEqual(mockGraphArray);
    });
  });

  describe('searchGraphs', () => {
    it('should search for graphs', async () => {
      const result = await controller.searchGraphs(mockRequest, 'test');
      
      expect(graphService.searchGraphs).toHaveBeenCalledWith('user1', 'test');
      expect(result).toEqual(mockGraphArray);
    });
  });

  describe('getGraphById', () => {
    it('should get a graph by ID', async () => {
      const result = await controller.getGraphById(mockRequest, 'graph1');
      
      expect(graphService.getGraphById).toHaveBeenCalledWith('user1', 'graph1');
      expect(result).toEqual(mockGraphResponseDto);
    });
  });

  describe('updateGraph', () => {
    it('should update a graph', async () => {
      const updateGraphDto: UpdateGraphDto = {
        name: 'Updated Graph',
        description: 'An updated test graph',
      };

      const result = await controller.updateGraph(mockRequest, 'graph1', updateGraphDto);
      
      expect(graphService.updateGraph).toHaveBeenCalledWith('user1', 'graph1', updateGraphDto);
      expect(result).toEqual(mockGraphResponseDto);
    });
  });

  describe('deleteGraph', () => {
    it('should delete a graph', async () => {
      await controller.deleteGraph(mockRequest, 'graph1');
      
      expect(graphService.deleteGraph).toHaveBeenCalledWith('user1', 'graph1');
    });

    it('should throw NotFoundException when graph is not found', async () => {
      jest.spyOn(graphService, 'deleteGraph').mockResolvedValueOnce(false);
      
      await expect(controller.deleteGraph(mockRequest, 'nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('addNode', () => {
    it('should add a node to a graph', async () => {
      const createNodeDto: CreateNodeDto = {
        notionId: 'test-id',
        title: 'Test Node',
        type: NodeType.PAGE
      };

      const result = await controller.addNode(mockRequest, 'graph1', createNodeDto);
      
      expect(graphService.addNode).toHaveBeenCalledWith('user1', 'graph1', createNodeDto);
      expect(result).toEqual(mockGraphResponseDto);
    });
  });

  describe('updateNode', () => {
    it('should update a node in a graph', async () => {
      const updateNodeDto: UpdateNodeDto = {
        title: 'Updated Node'
      };

      const result = await controller.updateNode(mockRequest, 'graph1', 'node1', updateNodeDto);
      
      expect(graphService.updateNode).toHaveBeenCalledWith('user1', 'graph1', 'node1', updateNodeDto);
      expect(result).toEqual(mockGraphResponseDto);
    });
  });

  describe('removeNode', () => {
    it('should remove a node from a graph', async () => {
      const result = await controller.removeNode(mockRequest, 'graph1', 'node1');
      
      expect(graphService.removeNode).toHaveBeenCalledWith('user1', 'graph1', 'node1');
      expect(result).toEqual(mockGraphResponseDto);
    });
  });

  describe('addEdge', () => {
    it('should add an edge to a graph', async () => {
      const createEdgeDto: CreateEdgeDto = {
        sourceId: 'node1',
        targetId: 'node2',
        type: EdgeType.PARENT_CHILD
      };

      const result = await controller.addEdge(mockRequest, 'graph1', createEdgeDto);
      
      expect(graphService.addEdge).toHaveBeenCalledWith('user1', 'graph1', createEdgeDto);
      expect(result).toEqual(mockGraphResponseDto);
    });
  });

  describe('updateEdge', () => {
    it('should update an edge in a graph', async () => {
      const updateEdgeDto: UpdateEdgeDto = {
        label: 'Updated Edge',
      };

      const result = await controller.updateEdge(mockRequest, 'graph1', 'edge1', updateEdgeDto);
      
      expect(graphService.updateEdge).toHaveBeenCalledWith('user1', 'graph1', 'edge1', updateEdgeDto);
      expect(result).toEqual(mockGraphResponseDto);
    });
  });

  describe('removeEdge', () => {
    it('should remove an edge from a graph', async () => {
      const result = await controller.removeEdge(mockRequest, 'graph1', 'edge1');
      
      expect(graphService.removeEdge).toHaveBeenCalledWith('user1', 'graph1', 'edge1');
      expect(result).toEqual(mockGraphResponseDto);
    });
  });

  describe('generateFromDatabase', () => {
    it('should generate a graph from a Notion database', async () => {
      const result = await controller.generateFromDatabase(
        mockRequest, 
        'db123', 
        'DB Graph', 
        'A graph from a database', 
        3
      );
      
      expect(graphGeneratorService.generateFromDatabase).toHaveBeenCalledWith(
        'user1', 
        'db123', 
        'DB Graph', 
        'A graph from a database', 
        3
      );
      expect(result).toHaveProperty('id', 'graph1');
    });
  });

  describe('generateFromPage', () => {
    it('should generate a graph from a Notion page', async () => {
      const result = await controller.generateFromPage(
        mockRequest, 
        'page123', 
        'Page Graph', 
        'A graph from a page', 
        3
      );
      
      expect(graphGeneratorService.generateFromPage).toHaveBeenCalledWith(
        'user1', 
        'page123', 
        'Page Graph', 
        'A graph from a page', 
        3
      );
      expect(result).toHaveProperty('id', 'graph1');
    });
  });

  describe('combineGraphs', () => {
    it('should combine multiple graphs', async () => {
      const graphIds = ['graph1', 'graph2'];
      const result = await controller.combineGraphs(
        mockRequest, 
        graphIds, 
        'Combined Graph', 
        'A combined graph'
      );
      
      expect(graphGeneratorService.combineGraphs).toHaveBeenCalledWith(
        'user1', 
        graphIds, 
        'Combined Graph', 
        'A combined graph'
      );
      expect(result).toHaveProperty('id', 'graph1');
    });
  });
}); 