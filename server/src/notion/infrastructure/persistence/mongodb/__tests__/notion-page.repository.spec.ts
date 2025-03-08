import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotionPageRepository } from '../notion-page.repository';
import { NotionPageDocument } from '../notion-page.schema';
import { NotionPage } from '../../../../domain/models/notion-page.entity';
import { PageProperty } from '../../../../domain/models/page-property.value-object';
import { Backlink } from '../../../../domain/models/backlink.value-object';

describe('NotionPageRepository', () => {
  let repository: NotionPageRepository;
  let model: Model<NotionPageDocument>;

  const mockProperty = {
    id: 'prop-123',
    name: 'Status',
    type: 'select',
    value: 'In Progress',
  };

  const mockBacklink = {
    id: 'bl-123',
    sourcePageId: 'page-456',
    sourcePageTitle: 'Source Page',
    targetPageId: 'page-123',
    createdAt: new Date(),
    context: 'Some context',
  };

  const mockPage = {
    id: 'page-123',
    title: 'Test Page',
    databaseId: 'db-123',
    url: 'https://notion.so/test-page',
    content: 'Test content',
    properties: [mockProperty],
    backlinks: [mockBacklink],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPageEntity = new NotionPage({
    id: mockPage.id,
    title: mockPage.title,
    databaseId: mockPage.databaseId,
    url: mockPage.url,
    content: mockPage.content,
    properties: [
      new PageProperty({
        id: mockProperty.id,
        name: mockProperty.name,
        type: mockProperty.type as any,
        value: mockProperty.value,
      }),
    ],
    backlinks: [
      new Backlink({
        id: mockBacklink.id,
        sourcePageId: mockBacklink.sourcePageId,
        sourcePageTitle: mockBacklink.sourcePageTitle,
        targetPageId: mockBacklink.targetPageId,
        createdAt: mockBacklink.createdAt,
        context: mockBacklink.context,
      }),
    ],
    createdAt: mockPage.createdAt,
    updatedAt: mockPage.updatedAt,
  });

  const mockModel = {
    findOne: jest.fn(),
    find: jest.fn(),
    findOneAndUpdate: jest.fn(),
    findOneAndDelete: jest.fn(),
    bulkWrite: jest.fn(),
    exec: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotionPageRepository,
        {
          provide: getModelToken(NotionPageDocument.name),
          useValue: mockModel,
        },
      ],
    }).compile();

    repository = module.get<NotionPageRepository>(NotionPageRepository);
    model = module.get<Model<NotionPageDocument>>(getModelToken(NotionPageDocument.name));

    // Reset mocks
    jest.clearAllMocks();

    // Setup default mock implementations
    mockModel.findOne.mockReturnThis();
    mockModel.find.mockReturnThis();
    mockModel.findOneAndUpdate.mockReturnThis();
    mockModel.findOneAndDelete.mockReturnThis();
    mockModel.exec.mockResolvedValue(mockPage);
    mockModel.bulkWrite.mockResolvedValue({});
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findById', () => {
    it('should find a page by id', async () => {
      const result = await repository.findById(mockPage.id);
      
      expect(mockModel.findOne).toHaveBeenCalledWith({ id: mockPage.id });
      expect(mockModel.exec).toHaveBeenCalled();
      expect(result).toBeInstanceOf(NotionPage);
      expect(result?.id).toBe(mockPage.id);
    });

    it('should return null if page not found', async () => {
      mockModel.exec.mockResolvedValueOnce(null);
      
      const result = await repository.findById('non-existent-id');
      
      expect(result).toBeNull();
    });
  });

  describe('findByDatabaseId', () => {
    it('should find pages by database id', async () => {
      mockModel.exec.mockResolvedValueOnce([mockPage]);
      
      const result = await repository.findByDatabaseId(mockPage.databaseId);
      
      expect(mockModel.find).toHaveBeenCalledWith({ databaseId: mockPage.databaseId });
      expect(mockModel.exec).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(NotionPage);
    });
  });

  describe('findWithBacklinks', () => {
    it('should find a page with backlinks', async () => {
      const result = await repository.findWithBacklinks(mockPage.id);
      
      expect(mockModel.findOne).toHaveBeenCalledWith({ id: mockPage.id });
      expect(mockModel.exec).toHaveBeenCalled();
      expect(result).toBeInstanceOf(NotionPage);
      expect(result?.backlinks).toHaveLength(1);
    });
  });

  describe('findOutgoingBacklinks', () => {
    it('should find pages with outgoing backlinks', async () => {
      mockModel.exec.mockResolvedValueOnce([mockPage]);
      
      const result = await repository.findOutgoingBacklinks(mockBacklink.sourcePageId);
      
      expect(mockModel.find).toHaveBeenCalledWith({ 'backlinks.sourcePageId': mockBacklink.sourcePageId });
      expect(mockModel.exec).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(NotionPage);
    });
  });

  describe('findAll', () => {
    it('should find all pages', async () => {
      mockModel.exec.mockResolvedValueOnce([mockPage]);
      
      const result = await repository.findAll();
      
      expect(mockModel.find).toHaveBeenCalled();
      expect(mockModel.exec).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(NotionPage);
    });
  });

  describe('save', () => {
    it('should save a page', async () => {
      await repository.save(mockPageEntity);
      
      expect(mockModel.findOneAndUpdate).toHaveBeenCalledWith(
        { id: mockPage.id },
        { $set: expect.objectContaining({
          id: mockPage.id,
          title: mockPage.title,
        }) },
        { upsert: true, new: true }
      );
      expect(mockModel.exec).toHaveBeenCalled();
    });
  });

  describe('saveMany', () => {
    it('should save multiple pages', async () => {
      await repository.saveMany([mockPageEntity]);
      
      expect(mockModel.bulkWrite).toHaveBeenCalledWith([
        expect.objectContaining({
          updateOne: expect.objectContaining({
            filter: { id: mockPage.id },
            update: { $set: expect.any(Object) },
            upsert: true,
          }),
        }),
      ]);
    });

    it('should not call bulkWrite if pages array is empty', async () => {
      await repository.saveMany([]);
      
      expect(mockModel.bulkWrite).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete a page', async () => {
      await repository.delete(mockPage.id);
      
      expect(mockModel.findOneAndDelete).toHaveBeenCalledWith({ id: mockPage.id });
      expect(mockModel.exec).toHaveBeenCalled();
    });
  });
}); 