import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, NotFoundException, ForbiddenException } from '@nestjs/common';
import { SharingController } from '../sharing.controller';
import { GraphSharingService } from '../../../../application/services/graph-sharing.service';
import { ShareGraphDto, SetPublicVisibilityDto, GraphResponseDto } from '../../../../application/dtos/graph.dto';
import { GraphTheme, LayoutAlgorithm } from '../../../../domain/models/graph-settings.value-object'
import { AuthGuard } from '../../../../../iam/interfaces/http/guards/auth.guard';
import { SubscriptionGuard } from '../../../../../iam/interfaces/http/guards/subscription.guard';

describe('SharingController', () => {
  let controller: SharingController;
  let graphSharingService: GraphSharingService;

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

  const mockUsersArray = [
    { id: 'user2', name: 'User 2', email: 'user2@example.com' },
    { id: 'user3', name: 'User 3', email: 'user3@example.com' },
  ];

  const mockRequest = {
    user: { id: 'user1' },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SharingController],
      providers: [
        {
          provide: GraphSharingService,
          useValue: {
            shareWithUsers: jest.fn().mockResolvedValue(mockGraphResponseDto),
            removeSharing: jest.fn().mockResolvedValue(mockGraphResponseDto),
            setPublicVisibility: jest.fn().mockResolvedValue(mockGraphResponseDto),
            getSharedUsers: jest.fn().mockResolvedValue(mockUsersArray),
          },
        },
      ],
    })
    .overrideGuard(AuthGuard)
    .useValue({ canActivate: () => true })
    .overrideGuard(SubscriptionGuard)
    .useValue({ canActivate: () => true })
    .compile();

    controller = module.get<SharingController>(SharingController);
    graphSharingService = module.get<GraphSharingService>(GraphSharingService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('shareGraph', () => {
    it('should share a graph with users', async () => {
      const shareDto: ShareGraphDto = {
        userIds: ['user2', 'user3'],
      };

      const result = await controller.shareGraph(mockRequest, 'graph1', shareDto);
      
      expect(graphSharingService.shareWithUsers).toHaveBeenCalledWith('user1', 'graph1', shareDto);
      expect(result).toEqual(mockGraphResponseDto);
    });

    it('should pass through NotFoundException', async () => {
      const shareDto: ShareGraphDto = {
        userIds: ['user2', 'user3'],
      };

      jest.spyOn(graphSharingService, 'shareWithUsers').mockImplementation(() => {
        throw new NotFoundException('Graph not found');
      });

      await expect(controller.shareGraph(mockRequest, 'nonexistent', shareDto))
        .rejects
        .toThrow(NotFoundException);
    });

    it('should pass through ForbiddenException', async () => {
      const shareDto: ShareGraphDto = {
        userIds: ['user2', 'user3'],
      };

      jest.spyOn(graphSharingService, 'shareWithUsers').mockImplementation(() => {
        throw new ForbiddenException('Not authorized');
      });

      await expect(controller.shareGraph(mockRequest, 'graph1', shareDto))
        .rejects
        .toThrow(ForbiddenException);
    });
  });

  describe('removeSharing', () => {
    it('should remove sharing for a graph', async () => {
      const userIds = ['user2', 'user3'];

      const result = await controller.removeSharing(mockRequest, 'graph1', userIds);
      
      expect(graphSharingService.removeSharing).toHaveBeenCalledWith('user1', 'graph1', userIds);
      expect(result).toEqual(mockGraphResponseDto);
    });

    it('should pass through NotFoundException', async () => {
      const userIds = ['user2', 'user3'];

      jest.spyOn(graphSharingService, 'removeSharing').mockImplementation(() => {
        throw new NotFoundException('Graph not found');
      });

      await expect(controller.removeSharing(mockRequest, 'nonexistent', userIds))
        .rejects
        .toThrow(NotFoundException);
    });

    it('should pass through ForbiddenException', async () => {
      const userIds = ['user2', 'user3'];

      jest.spyOn(graphSharingService, 'removeSharing').mockImplementation(() => {
        throw new ForbiddenException('Not authorized');
      });

      await expect(controller.removeSharing(mockRequest, 'graph1', userIds))
        .rejects
        .toThrow(ForbiddenException);
    });
  });

  describe('setPublicVisibility', () => {
    it('should set public visibility for a graph', async () => {
      const visibilityDto: SetPublicVisibilityDto = {
        isPublic: true,
      };

      const result = await controller.setPublicVisibility(mockRequest, 'graph1', visibilityDto);
      
      expect(graphSharingService.setPublicVisibility).toHaveBeenCalledWith('user1', 'graph1', visibilityDto);
      expect(result).toEqual(mockGraphResponseDto);
    });

    it('should pass through NotFoundException', async () => {
      const visibilityDto: SetPublicVisibilityDto = {
        isPublic: true,
      };

      jest.spyOn(graphSharingService, 'setPublicVisibility').mockImplementation(() => {
        throw new NotFoundException('Graph not found');
      });

      await expect(controller.setPublicVisibility(mockRequest, 'nonexistent', visibilityDto))
        .rejects
        .toThrow(NotFoundException);
    });

    it('should pass through ForbiddenException', async () => {
      const visibilityDto: SetPublicVisibilityDto = {
        isPublic: true,
      };

      jest.spyOn(graphSharingService, 'setPublicVisibility').mockImplementation(() => {
        throw new ForbiddenException('Not authorized');
      });

      await expect(controller.setPublicVisibility(mockRequest, 'graph1', visibilityDto))
        .rejects
        .toThrow(ForbiddenException);
    });
  });

  describe('getSharedUsers', () => {
    it('should get users with whom a graph is shared', async () => {
      const result = await controller.getSharedUsers(mockRequest, 'graph1');
      
      expect(graphSharingService.getSharedUsers).toHaveBeenCalledWith('user1', 'graph1');
      expect(result).toEqual(mockUsersArray);
    });

    it('should pass through NotFoundException', async () => {
      jest.spyOn(graphSharingService, 'getSharedUsers').mockImplementation(() => {
        throw new NotFoundException('Graph not found');
      });

      await expect(controller.getSharedUsers(mockRequest, 'nonexistent'))
        .rejects
        .toThrow(NotFoundException);
    });

    it('should pass through ForbiddenException', async () => {
      jest.spyOn(graphSharingService, 'getSharedUsers').mockImplementation(() => {
        throw new ForbiddenException('Not authorized');
      });

      await expect(controller.getSharedUsers(mockRequest, 'graph1'))
        .rejects
        .toThrow(ForbiddenException);
    });
  });
}); 