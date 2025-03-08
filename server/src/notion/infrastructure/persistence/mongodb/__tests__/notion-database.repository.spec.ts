import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { NotionDatabaseRepository } from '../notion-database.repository';
import { NotionDatabaseDocument as DbEntity } from '../notion-database.schema';
import { NotionDatabase as DomainDatabase } from '../../../../domain/models/notion-database.entity';

describe('NotionDatabaseRepository', () => {
  let repository: NotionDatabaseRepository;
  let model: Model<DbEntity>;

  // Mock domain model
  const mockDomainDatabase = {
    id: 'db-123',
    title: 'Test Database',
    workspaceId: 'ws-123',
    ownerId: 'user-123',
    lastSyncedAt: new Date(),
    description: 'Test description',
    url: 'https://notion.so/test-db',
    createdAt: new Date(),
    updatedAt: new Date(),
    getPages: jest.fn().mockReturnValue([]),
    addPage: jest.fn(),
    markAsSynced: jest.fn(),
    addEvent: jest.fn(),
    clearEvents: jest.fn(),
    domainEvents: [],
    pages: []
  };

  // Create a proper domain entity
  const mockDatabaseEntity = new DomainDatabase({
    id: mockDomainDatabase.id,
    title: mockDomainDatabase.title,
    workspaceId: mockDomainDatabase.workspaceId,
    ownerId: mockDomainDatabase.ownerId,
    lastSyncedAt: mockDomainDatabase.lastSyncedAt,
    description: mockDomainDatabase.description,
    url: mockDomainDatabase.url,
    createdAt: mockDomainDatabase.createdAt,
    updatedAt: mockDomainDatabase.updatedAt,
  });

  // Mock MongoDB entity
  const mockMongoEntity = {
    _id: new Types.ObjectId(),
    notionId: 'db-123',
    title: 'Test Database',
    userId: new Types.ObjectId(),
    description: 'Test description',
    url: 'https://notion.so/test-db',
    save: jest.fn().mockResolvedValue(this),
    pages: []
  };

  const mockModel = {
    findOne: jest.fn().mockReturnThis(),
    findById: jest.fn().mockReturnThis(),
    find: jest.fn().mockReturnThis(),
    findByIdAndDelete: jest.fn().mockReturnThis(),
    deleteMany: jest.fn().mockReturnThis(),
    updateOne: jest.fn().mockReturnThis(),
    create: jest.fn().mockResolvedValue(mockMongoEntity),
    exec: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotionDatabaseRepository,
        {
          provide: getModelToken(DbEntity.name),
          useValue: mockModel,
        },
      ],
    }).compile();

    repository = module.get<NotionDatabaseRepository>(NotionDatabaseRepository);
    model = module.get<Model<DbEntity>>(getModelToken(DbEntity.name));

    // Reset mocks
    jest.clearAllMocks();

    // Setup default mock implementations
    mockModel.exec.mockResolvedValue(mockMongoEntity);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findById', () => {
    it('should find a database by id', async () => {
      const result = await repository.findById('some-id');
      
      expect(mockModel.findById).toHaveBeenCalledWith('some-id');
      expect(mockModel.exec).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should return null if database not found', async () => {
      mockModel.exec.mockResolvedValueOnce(null);
      
      const result = await repository.findById('non-existent-id');
      
      expect(result).toBeNull();
    });
  });

  describe('findByWorkspaceId', () => {
    it('should find databases by workspace id', async () => {
      mockModel.exec.mockResolvedValueOnce([mockMongoEntity]);
      
      const result = await repository.findByWorkspaceId('ws-123');
      
      expect(mockModel.find).toHaveBeenCalledWith({ workspaceId: 'ws-123' });
      expect(mockModel.exec).toHaveBeenCalled();
      expect(result).toHaveLength(1);
    });
  });

  describe('findByOwnerId', () => {
    it('should find databases by owner id', async () => {
      mockModel.exec.mockResolvedValueOnce([mockMongoEntity]);
      
      const result = await repository.findByOwnerId('user-123');
      
      expect(mockModel.find).toHaveBeenCalledWith({ userId: 'user-123' });
      expect(mockModel.exec).toHaveBeenCalled();
      expect(result).toHaveLength(1);
    });
  });

  describe('findAll', () => {
    it('should find all databases', async () => {
      mockModel.exec.mockResolvedValueOnce([mockMongoEntity]);
      
      const result = await repository.findAll();
      
      expect(mockModel.find).toHaveBeenCalled();
      expect(mockModel.exec).toHaveBeenCalled();
      expect(result).toHaveLength(1);
    });
  });

  describe('save', () => {
    it('should save a database', async () => {
      // Mock finding existing database
      mockModel.exec.mockResolvedValueOnce(null); // No existing database found
      
      await repository.save(mockDatabaseEntity);
      
      // First it should check if database exists
      expect(mockModel.findOne).toHaveBeenCalledWith({ notionId: mockDatabaseEntity.id });
      expect(mockModel.exec).toHaveBeenCalled();
      
      // Should attempt to create a new database
      expect(mockModel.create).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete a database', async () => {
      await repository.delete('some-id');
      
      expect(mockModel.findByIdAndDelete).toHaveBeenCalledWith('some-id');
      expect(mockModel.exec).toHaveBeenCalled();
    });
  });
}); 