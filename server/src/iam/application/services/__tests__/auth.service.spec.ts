import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../auth.service';
import { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { EventBusService } from '../../../../shared/infrastructure/event-bus/event-bus.service';
import { User } from '../../../domain/models/user.entity';
import { AuthToken } from '../../../domain/models/auth-token.value-object';
import { NotionCredentials } from '../../../domain/models/notion-credentials.value-object';

// Mock bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
  compare: jest.fn().mockResolvedValue(true),
}));

describe('AuthService', () => {
  let service: AuthService;
  let mockUserRepository: jest.Mocked<IUserRepository>;
  let mockJwtService: jest.Mocked<JwtService>;
  let mockConfigService: jest.Mocked<ConfigService>;
  let mockEventBus: jest.Mocked<EventBusService>;

  // Sample test data
  const mockUser = {
    id: 'test_id',
    email: 'test@example.com',
    name: 'Test User',
    isAuthenticated: () => true,
    hasNotionAccess: () => false,
    createdAt: new Date(),
    updatedAt: new Date(),
    domainEvents: [],
    clearEvents: jest.fn(),
    addEvent: jest.fn(),
    notionCredentials: undefined,
    authToken: undefined,
    setNotionCredentials: jest.fn(),
    setAuthToken: jest.fn(),
  } as unknown as User;

  const registerDto = {
    email: 'test@example.com',
    password: 'password123',
    name: 'Test User',
  };

  const loginDto = {
    email: 'test@example.com',
    password: 'password123',
  };

  const notionDto = {
    accessToken: 'notion_token',
    workspaceId: 'workspace_id',
    workspaceName: 'Test Workspace',
    botId: 'bot_id',
  };

  beforeEach(() => {
    // Create mocks
    mockUserRepository = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      findByNotionWorkspaceId: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn().mockImplementation(() => Promise.resolve()),
      delete: jest.fn(),
    } as jest.Mocked<IUserRepository>;

    mockJwtService = {
      signAsync: jest.fn(),
      sign: jest.fn(),
      verify: jest.fn(),
      verifyAsync: jest.fn(),
      decode: jest.fn(),
    } as unknown as jest.Mocked<JwtService>;

    mockConfigService = {
      get: jest.fn(),
      getOrThrow: jest.fn(),
    } as unknown as jest.Mocked<ConfigService>;

    mockEventBus = {
      publish: jest.fn(),
      publishAll: jest.fn(),
    } as unknown as jest.Mocked<EventBusService>;

    // Directly instantiate the service with the mocked dependencies
    service = new AuthService(
      mockUserRepository,
      mockJwtService,
      mockConfigService,
      mockEventBus
    );

    // Common setup
    mockConfigService.get.mockReturnValue('test_secret');
    mockJwtService.signAsync.mockResolvedValue('test_token');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      // Arrange
      mockUserRepository.findByEmail.mockResolvedValue(null);
      
      // Act
      const result = await service.register(registerDto);
      
      // Assert
      expect(result).toBeDefined();
      expect(result.token).toBeDefined();
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(registerDto.email);
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it('should throw ConflictException if user already exists', async () => {
      // Arrange
      mockUserRepository.findByEmail.mockResolvedValue({} as User);
      
      // Act & Assert
      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      // Arrange
      const userWithToken = mockUser as User & {
        authToken: any;
      };
      
      userWithToken.authToken = { 
        token: 'hashed_password',
        expiresAt: new Date(),
        equals: jest.fn(),
        isExpired: jest.fn().mockReturnValue(false),
        getToken: jest.fn().mockReturnValue('hashed_password'),
        getExpiresAt: jest.fn().mockReturnValue(new Date()),
        isMatch: jest.fn().mockResolvedValue(true)
      };
      
      mockUserRepository.findByEmail.mockResolvedValue(userWithToken);
      
      // Act
      const result = await service.login(loginDto);
      
      // Assert
      expect(result).toBeDefined();
      expect(result.token).toBeDefined();
    });

    it('should throw UnauthorizedException if user not found', async () => {
      // Arrange
      mockUserRepository.findByEmail.mockResolvedValue(null);
      
      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('connectNotion', () => {
    it('should connect Notion successfully', async () => {
      // Arrange
      mockUserRepository.findById.mockResolvedValue(mockUser);
      
      // Act
      const result = await service.connectNotion('test_id', notionDto);
      
      // Assert
      expect(result).toBeDefined();
      expect(mockUserRepository.findById).toHaveBeenCalledWith('test_id');
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if user not found', async () => {
      // Arrange
      mockUserRepository.findById.mockResolvedValue(null);
      
      // Act & Assert
      await expect(service.connectNotion('test_id', notionDto)).rejects.toThrow(UnauthorizedException);
    });
  });
}); 