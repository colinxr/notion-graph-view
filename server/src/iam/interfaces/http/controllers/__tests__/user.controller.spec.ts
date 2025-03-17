import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UserController } from '../user.controller';
import { UserService } from '../../../../application/services/user.service';
import { UserDto, UserListDto } from '../../../../application/dtos/user.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ClerkAuthGuard } from '../../guards/clerk-auth.guard';
import { ClerkService } from '../../../../infrastructure/clerk/clerk.service';
import { ClerkAuthUser } from '../../../../application/dtos/clerk-session.dto';

// Create a mock AuthGuard
class MockClerkAuthGuard {
  canActivate() {
    return true;
  }
}

describe('UserController', () => {
  let controller: UserController;
  let userService: jest.Mocked<UserService>;
  let clerkService: jest.Mocked<ClerkService>;

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

  const mockClerkUser: ClerkAuthUser = {
    id: 'clerk_test_id',
    email: 'clerk_test@example.com',
    notionConnected: true,
  };

  beforeEach(async () => {
    // Create mock service
    const mockUserService = {
      findById: jest.fn(),
      findAll: jest.fn(),
      findByEmail: jest.fn(),
      findByNotionWorkspace: jest.fn(),
    };

    // Mock ClerkService
    const mockClerkService = {
      validateRequest: jest.fn(),
      getUserInfo: jest.fn(),
      updateNotionAccessToken: jest.fn(),
    };

    // Mock implementations for JwtService and ConfigService
    const mockJwtService = {
      signAsync: jest.fn(),
      verifyAsync: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn().mockImplementation((key) => {
        if (key === 'JWT_SECRET') return 'test-secret';
        if (key === 'CLERK_SECRET_KEY') return 'test-clerk-secret';
        if (key === 'CLERK_PUBLISHABLE_KEY') return 'test-clerk-publishable';
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
          provide: ClerkService,
          useValue: mockClerkService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: ClerkAuthGuard,
          useClass: MockClerkAuthGuard,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get(UserService);
    clerkService = module.get(ClerkService);
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
      const result = await controller.getClerkCurrentUser(mockClerkUser);

      // Assert
      expect(result).toEqual(mockUser);
      expect(userService.findById).toHaveBeenCalledWith(mockClerkUser.id);
    });

    it('should create a user DTO from Clerk data when user not in database', async () => {
      // Arrange
      userService.findById.mockRejectedValue(new NotFoundException('User not found'));
      clerkService.getUserInfo.mockResolvedValue(mockClerkUser);

      // Act
      const result = await controller.getClerkCurrentUser(mockClerkUser);

      // Assert
      expect(result).toMatchObject({
        id: mockClerkUser.id,
        email: mockClerkUser.email,
        name: mockClerkUser.email.split('@')[0],
        isAuthenticated: true,
        hasNotionAccess: mockClerkUser.notionConnected,
      });
      expect(clerkService.getUserInfo).toHaveBeenCalledWith(mockClerkUser.id);
    });
  });
});