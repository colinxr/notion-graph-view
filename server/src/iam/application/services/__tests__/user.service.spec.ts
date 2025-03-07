import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UserService } from '../user.service';
import { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { User } from '../../../domain/models/user.entity';
import { UserDto, UserListDto } from '../../dtos/user.dto';

describe('UserService', () => {
  let service: UserService;
  let mockUserRepository: jest.Mocked<IUserRepository>;

  const mockUser = {
    id: 'test_id',
    email: 'test@example.com',
    name: 'Test User',
    isAuthenticated: () => false,
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

  const mockUserDto = {
    id: mockUser.id,
    email: mockUser.email,
    name: mockUser.name,
    isAuthenticated: false,
    hasNotionAccess: false,
    createdAt: mockUser.createdAt,
    updatedAt: mockUser.updatedAt,
  };

  beforeEach(() => {
    // Create mocks
    mockUserRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findByNotionWorkspaceId: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    } as jest.Mocked<IUserRepository>;

    // Directly instantiate the service with the mocked repository
    service = new UserService(mockUserRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findById', () => {
    it('should return a user when found', async () => {
      // Arrange
      mockUserRepository.findById.mockResolvedValue(mockUser);
      
      // Act
      const result = await service.findById('test_id');
      
      // Assert
      expect(result).toEqual(mockUserDto);
      expect(mockUserRepository.findById).toHaveBeenCalledWith('test_id');
    });

    it('should throw NotFoundException when user not found', async () => {
      // Arrange
      mockUserRepository.findById.mockResolvedValue(null);
      
      // Act & Assert
      await expect(service.findById('test_id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByEmail', () => {
    it('should return a user when found', async () => {
      // Arrange
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      
      // Act
      const result = await service.findByEmail('test@example.com');
      
      // Assert
      expect(result).toEqual(mockUserDto);
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
    });

    it('should throw NotFoundException when user not found', async () => {
      // Arrange
      mockUserRepository.findByEmail.mockResolvedValue(null);
      
      // Act & Assert
      await expect(service.findByEmail('test@example.com')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByNotionWorkspace', () => {
    it('should return a user when found', async () => {
      // Arrange
      mockUserRepository.findByNotionWorkspaceId.mockResolvedValue(mockUser);
      
      // Act
      const result = await service.findByNotionWorkspace('workspace_id');
      
      // Assert
      expect(result).toEqual(mockUserDto);
      expect(mockUserRepository.findByNotionWorkspaceId).toHaveBeenCalledWith('workspace_id');
    });

    it('should throw NotFoundException when user not found', async () => {
      // Arrange
      mockUserRepository.findByNotionWorkspaceId.mockResolvedValue(null);
      
      // Act & Assert
      await expect(service.findByNotionWorkspace('workspace_id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      // Arrange
      const mockUsers = [mockUser, { ...mockUser, id: 'test_id_2' } as User];
      mockUserRepository.findAll.mockResolvedValue(mockUsers);
      
      // Act
      const result = await service.findAll();
      
      // Assert
      expect(result.users.length).toBe(2);
      expect(result.total).toBe(2);
      expect(mockUserRepository.findAll).toHaveBeenCalled();
    });

    it('should return empty list when no users found', async () => {
      // Arrange
      mockUserRepository.findAll.mockResolvedValue([]);
      
      // Act
      const result = await service.findAll();
      
      // Assert
      expect(result.users.length).toBe(0);
      expect(result.total).toBe(0);
      expect(mockUserRepository.findAll).toHaveBeenCalled();
    });
  });
}); 