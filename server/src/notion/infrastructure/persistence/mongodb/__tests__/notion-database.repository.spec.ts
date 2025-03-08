import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotionDatabaseRepository } from '../notion-database.repository';
import { NotionDatabaseDocument } from '../notion-database.schema';
import { NotionDatabase } from '../../../../domain/models/notion-database.entity';

describe('NotionDatabaseRepository', () => {
  let repository: NotionDatabaseRepository;
  let model: Model<NotionDatabaseDocument>;

  const mockDatabase = {
    id: 'db-123',
    title: 'Test Database',
    workspaceId: 'ws-123',
    ownerId: 'user-123',
    lastSyncedAt: new Date(),
    description: 'Test description',
    url: 'https://notion.so/test-db',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockDatabaseEntity = new NotionDatabase({
    id: mockDatabase.id,
    title: mockDatabase.title,
    workspaceId: mockDatabase.workspaceId,
    ownerId: mockDatabase.ownerId,
    lastSyncedAt: mockDatabase.lastSyncedAt,
    description: mockDatabase.description,
    url: mockDatabase.url,
    createdAt: mockDatabase.createdAt,
    updatedAt: mockDatabase.updatedAt,
  });

  const mockModel = {
    findOne: jest.fn(),
    find: jest.fn(),
    findOneAndUpdate: jest.fn(),
    findOneAndDelete: jest.fn(),
    exec: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotionDatabaseRepository,
        {
          provide: getModelToken(NotionDatabaseDocument.name),
          useValue: mockModel,
        },
      ],
    }).compile();

    repository = module.get<NotionDatabaseRepository>(NotionDatabaseRepository);
    model = module.get<Model<NotionDatabaseDocument>>(getModelToken(NotionDatabaseDocument.name));

    // Reset mocks
    jest.clearAllMocks();

    // Setup default mock implementations
    mockModel.findOne.mockReturnThis();
    mockModel.find.mockReturnThis();
    mockModel.findOneAndUpdate.mockReturnThis();
    mockModel.findOneAndDelete.mockReturnThis();
    mockModel.exec.mockResolvedValue(mockDatabase);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findById', () => {
    it('should find a database by id', async () => {
      const result = await repository.findById(mockDatabase.id);
      
      expect(mockModel.findOne).toHaveBeenCalledWith({ id: mockDatabase.id });
      expect(mockModel.exec).toHaveBeenCalled();
      expect(result).toBeInstanceOf(NotionDatabase);
      expect(result?.id).toBe(mockDatabase.id);
    });

    it('should return null if database not found', async () => {
      mockModel.exec.mockResolvedValueOnce(null);
      
      const result = await repository.findById('non-existent-id');
      
      expect(result).toBeNull();
    });
  });

  describe('findByWorkspaceId', () => {
    it('should find databases by workspace id', async () => {
      mockModel.exec.mockResolvedValueOnce([mockDatabase]);
      
      const result = await repository.findByWorkspaceId(mockDatabase.workspaceId);
      
      expect(mockModel.find).toHaveBeenCalledWith({ workspaceId: mockDatabase.workspaceId });
      expect(mockModel.exec).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(NotionDatabase);
    });
  });

  describe('findByOwnerId', () => {
    it('should find databases by owner id', async () => {
      mockModel.exec.mockResolvedValueOnce([mockDatabase]);
      
      const result = await repository.findByOwnerId(mockDatabase.ownerId);
      
      expect(mockModel.find).toHaveBeenCalledWith({ ownerId: mockDatabase.ownerId });
      expect(mockModel.exec).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(NotionDatabase);
    });
  });

  describe('findAll', () => {
    it('should find all databases', async () => {
      mockModel.exec.mockResolvedValueOnce([mockDatabase]);
      
      const result = await repository.findAll();
      
      expect(mockModel.find).toHaveBeenCalled();
      expect(mockModel.exec).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(NotionDatabase);
    });
  });

  describe('save', () => {
    it('should save a database', async () => {
      await repository.save(mockDatabaseEntity);
      
      expect(mockModel.findOneAndUpdate).toHaveBeenCalledWith(
        { id: mockDatabase.id },
        { $set: expect.objectContaining({
          id: mockDatabase.id,
          title: mockDatabase.title,
        }) },
        { upsert: true, new: true }
      );
      expect(mockModel.exec).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete a database', async () => {
      await repository.delete(mockDatabase.id);
      
      expect(mockModel.findOneAndDelete).toHaveBeenCalledWith({ id: mockDatabase.id });
      expect(mockModel.exec).toHaveBeenCalled();
    });
  });
}); 