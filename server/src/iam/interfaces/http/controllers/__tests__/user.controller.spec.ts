import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UserController } from '../user.controller';
import { UserService } from '../../../../application/services/user.service';
import { UserDto, UserListDto } from '../../../../application/dtos/user.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '../../guards/auth.guard';

// Create a mock AuthGuard
class MockAuthGuard {
  canActivate() {
    return true;
  }
}

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

  beforeEach(async () => {
    // Create mock service
    const mockUserService = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findByNotionWorkspace: jest.fn(),
      findAll: jest.fn(),
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
        {
          provide: AuthGuard,
          useClass: MockAuthGuard,
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

  describe('findByEmail', () => {
    it('should return a user when found', async () => {
      // Arrange
      userService.findByEmail.mockResolvedValue(mockUser);
      const email = 'test@example.com';

      // Act
      const result = await controller.findByEmail(email);

      // Assert
      expect(result).toEqual(mockUser);
      expect(userService.findByEmail).toHaveBeenCalledWith(email);
    });

    it('should forward NotFoundException when user not found', async () => {
      // Arrange
      userService.findByEmail.mockRejectedValue(new NotFoundException('User not found'));
      const email = 'nonexistent@example.com';

      // Act & Assert
      await expect(controller.findByEmail(email)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByNotionWorkspace', () => {
    it('should return a user when found', async () => {
      // Arrange
      userService.findByNotionWorkspace.mockResolvedValue(mockUser);
      const workspaceId = 'workspace_id';

      // Act
      const result = await controller.findByNotionWorkspace(workspaceId);

      // Assert
      expect(result).toEqual(mockUser);
      expect(userService.findByNotionWorkspace).toHaveBeenCalledWith(workspaceId);
    });

    it('should forward NotFoundException when user not found', async () => {
      // Arrange
      userService.findByNotionWorkspace.mockRejectedValue(new NotFoundException('User not found'));
      const workspaceId = 'nonexistent_workspace';

      // Act & Assert
      await expect(controller.findByNotionWorkspace(workspaceId)).rejects.toThrow(NotFoundException);
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

  describe('getCurrentUser', () => {
    it('should return the current authenticated user', async () => {
      // Arrange
      const userId = 'test_id';
      const mockRequest = { user: { sub: userId } };
      userService.findById.mockResolvedValue(mockUser);

      // Act
      const result = await controller.getCurrentUser(mockRequest as any);

      // Assert
      expect(result).toEqual(mockUser);
      expect(userService.findById).toHaveBeenCalledWith(userId);
    });

    it('should forward NotFoundException when current user not found', async () => {
      // Arrange
      const userId = 'nonexistent_id';
      const mockRequest = { user: { sub: userId } };
      userService.findById.mockRejectedValue(new NotFoundException('User not found'));

      // Act & Assert
      await expect(controller.getCurrentUser(mockRequest as any)).rejects.toThrow(NotFoundException);
    });
  });
}); 