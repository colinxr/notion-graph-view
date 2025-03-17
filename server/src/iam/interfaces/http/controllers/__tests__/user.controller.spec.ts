import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UserController } from '../user.controller';
import { UserService } from '../../../../application/services/user.service';
import { UserDto, UserListDto } from '../../../../application/dtos/user.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ClerkAuthUser } from '../../../../application/dtos/clerk-session.dto';

describe('UserController', () => {
  let controller: UserController;
  let userService: jest.Mocked<UserService>;

  // Sample data
  const mockUser: UserDto = {
    id: 'test_id',
    email: 'test@example.com',
    name: 'Test User',
    isAuthenticated: true,
    hasNotionAccess: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUsers: UserListDto = {
    users: [mockUser, { ...mockUser, id: 'test_id_2' }],
    total: 2,
  };

  const mockRequest = {
    auth: {
      userId: 'clerk_test_id',
      sessionId: 'test_session_id',
      notionAccessToken: 'test_notion_token',
    }
  };

  beforeEach(async () => {
    // Create mock service
    const mockUserService = {
      findById: jest.fn(),
      findAll: jest.fn(),
      findByEmail: jest.fn(),
      findByNotionWorkspace: jest.fn(),
    };

    // Mock implementations for JwtService and ConfigService
    const mockJwtService = {
      signAsync: jest.fn(),
      verifyAsync: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn().mockImplementation((key) => {
        if (key === 'JWT_SECRET') return 'test-secret';
        return null;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findById', () => {
    it('should return a user when found', async () => {
      // Arrange
      userService.findById.mockResolvedValue(mockUser);
      const userId = 'test_id';

      // Act
      const result = await controller.findById(userId);

      // Assert
      expect(result).toEqual(mockUser);
      expect(userService.findById).toHaveBeenCalledWith(userId);
    });

    it('should forward NotFoundException when user not found', async () => {
      // Arrange
      userService.findById.mockRejectedValue(new NotFoundException('User not found'));
      const userId = 'nonexistent_id';

      // Act & Assert
      await expect(controller.findById(userId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      // Arrange
      userService.findAll.mockResolvedValue(mockUsers);

      // Act
      const result = await controller.findAll();

      // Assert
      expect(result).toEqual(mockUsers);
      expect(userService.findAll).toHaveBeenCalled();
    });
  });

  describe('getClerkCurrentUser', () => {
    it('should return user from database when found', async () => {
      // Arrange
      userService.findById.mockResolvedValue(mockUser);

      // Act
      const result = await controller.getClerkCurrentUser(mockRequest as any);

      // Assert
      expect(result).toEqual(mockUser);
      expect(userService.findById).toHaveBeenCalledWith(mockRequest.auth.userId);
    });

    it('should create a user DTO when user not in database', async () => {
      // Arrange
      userService.findById.mockRejectedValue(new NotFoundException('User not found'));

      // Act
      const result = await controller.getClerkCurrentUser(mockRequest as any);

      // Assert
      expect(result).toMatchObject({
        id: mockRequest.auth.userId,
        isAuthenticated: true,
        hasNotionAccess: true,
      });
    });
  });
});