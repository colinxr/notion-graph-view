import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseController } from '../database.controller';
import { DatabaseService } from '../../../../application/services/database.service';
import { NotionDatabaseDto, DatabaseSyncResultDto } from '../../../../application/dtos/database.dto';
import { NotFoundException } from '@nestjs/common';
import { UserDto } from '../../../../../iam/application/dtos/user.dto';
import { AuthGuard } from '../../../../../iam/interfaces/http/guards/auth.guard';
import { SubscriptionGuard } from '../../../../../iam/interfaces/http/guards/subscription.guard';

describe('DatabaseController', () => {
  let controller: DatabaseController;
  let databaseService: jest.Mocked<DatabaseService>;

  // Mock data
  const mockUser: UserDto = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'user',
    isAuthenticated: true,
    hasNotionAccess: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const mockDatabase: NotionDatabaseDto = {
    id: 'db-123',
    title: 'Test Database',
    workspaceId: 'ws-123',
    ownerId: 'owner-123',
    lastSyncedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockDatabaseSyncResult: DatabaseSyncResultDto = {
    databaseId: 'db-123',
    newPages: 2,
    updatedPages: 3,
    totalPages: 5,
    syncedAt: new Date(),
  };

  beforeEach(async () => {
    // Create mock database service
    const mockDatabaseService = {
      getAllDatabases: jest.fn().mockResolvedValue([mockDatabase]),
      getDatabasesByWorkspace: jest.fn().mockResolvedValue([mockDatabase]),
      getDatabaseById: jest.fn().mockResolvedValue(mockDatabase),
      syncDatabase: jest.fn().mockResolvedValue(mockDatabaseSyncResult),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DatabaseController],
      providers: [
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
      ],
    })
    .overrideGuard(AuthGuard)
    .useValue({ canActivate: () => true })
    .overrideGuard(SubscriptionGuard)
    .useValue({ canActivate: () => true })
    .compile();

    controller = module.get<DatabaseController>(DatabaseController);
    databaseService = module.get(DatabaseService) as jest.Mocked<DatabaseService>;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getDatabases', () => {
    it('should return all databases when no workspace ID is provided', async () => {
      // Act
      const result = await controller.getDatabases(mockUser);
      console.log(result);
      

      // Assert
      expect(databaseService.getAllDatabases).toHaveBeenCalled();
      expect(result).toEqual([mockDatabase]);
    });

    it('should return databases filtered by workspace ID', async () => {
      // Arrange
      const workspaceId = 'ws-123';

      // Act
      const result = await controller.getDatabases(mockUser, workspaceId);

      // Assert
      expect(databaseService.getDatabasesByWorkspace).toHaveBeenCalledWith(workspaceId);
      expect(result).toEqual([mockDatabase]);
    });
  });

  describe('getDatabase', () => {
    it('should return a database by ID', async () => {
      // Arrange
      const databaseId = 'db-123';

      // Act
      const result = await controller.getDatabase(databaseId);

      // Assert
      expect(databaseService.getDatabaseById).toHaveBeenCalledWith(databaseId);
      expect(result).toEqual(mockDatabase);
    });

    it('should throw NotFoundException when database not found', async () => {
      // Arrange
      const databaseId = 'non-existent';
      databaseService.getDatabaseById.mockRejectedValueOnce(new NotFoundException());

      // Act & Assert
      await expect(controller.getDatabase(databaseId)).rejects.toThrow(NotFoundException);
      expect(databaseService.getDatabaseById).toHaveBeenCalledWith(databaseId);
    });
  });

  describe('syncDatabase', () => {
    it('should sync database and return result', async () => {
      // Arrange
      const databaseId = 'db-123';

      // Act
      const result = await controller.syncDatabase(databaseId);

      // Assert
      expect(databaseService.syncDatabase).toHaveBeenCalledWith(databaseId);
      expect(result).toEqual(mockDatabaseSyncResult);
    });

    it('should throw NotFoundException when database not found during sync', async () => {
      // Arrange
      const databaseId = 'non-existent';
      databaseService.syncDatabase.mockRejectedValueOnce(new NotFoundException());

      // Act & Assert
      await expect(controller.syncDatabase(databaseId)).rejects.toThrow(NotFoundException);
      expect(databaseService.syncDatabase).toHaveBeenCalledWith(databaseId);
    });
  });
}); 