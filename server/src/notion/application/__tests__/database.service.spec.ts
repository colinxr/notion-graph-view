import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../services/database.service';
import { INotionDatabaseRepository } from '../../domain/repositories/notion-database.repository.interface';
import { INotionPageRepository } from '../../domain/repositories/notion-page.repository.interface';
import { NotionApiService } from '../../infrastructure/api/notion-api.service';
import { NotionDatabase } from '../../domain/models/notion-database.entity';
import { NotionPage } from '../../domain/models/notion-page.entity';
import { DatabaseObjectResponse, PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';

describe('DatabaseService', () => {
  let service: DatabaseService;
  let databaseRepository: jest.Mocked<INotionDatabaseRepository>;
  let pageRepository: jest.Mocked<INotionPageRepository>;
  let notionApiService: jest.Mocked<NotionApiService>;

  // Helper function to create a sample database
  const createSampleDatabase = (id: string, title: string): NotionDatabase => {
    return new NotionDatabase({
      id,
      title,
      workspaceId: 'ws-1',
      ownerId: 'user-1',
      lastSyncedAt: new Date('2023-01-01'),
      description: 'Sample database',
      url: `https://notion.so/${id}`,
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01')
    });
  };

  // Helper function to create a sample page
  const createSamplePage = (id: string, title: string, databaseId: string): NotionPage => {
    return new NotionPage({
      id,
      title,
      databaseId,
      url: `https://notion.so/${id}`,
      content: 'Sample content',
      properties: [],
      backlinks: [],
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01')
    });
  };

  beforeEach(async () => {
    // Create mock repositories and services
    const mockDatabaseRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByWorkspaceId: jest.fn(),
      findByOwnerId: jest.fn(),
      save: jest.fn(),
      delete: jest.fn()
    };

    const mockPageRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByDatabaseId: jest.fn(),
      findWithBacklinks: jest.fn(),
      findOutgoingBacklinks: jest.fn(),
      save: jest.fn(),
      saveMany: jest.fn(),
      delete: jest.fn()
    };

    const mockNotionApiService = {
      getDatabase: jest.fn(),
      queryDatabase: jest.fn(),
      getPage: jest.fn(),
      getPageBlocks: jest.fn(),
      search: jest.fn()
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DatabaseService,
        {
          provide: 'INotionDatabaseRepository',
          useValue: mockDatabaseRepository
        },
        {
          provide: 'INotionPageRepository',
          useValue: mockPageRepository
        },
        {
          provide: NotionApiService,
          useValue: mockNotionApiService
        }
      ],
    }).compile();

    service = module.get<DatabaseService>(DatabaseService);
    databaseRepository = module.get('INotionDatabaseRepository') as jest.Mocked<INotionDatabaseRepository>;
    pageRepository = module.get('INotionPageRepository') as jest.Mocked<INotionPageRepository>;
    notionApiService = module.get<NotionApiService>(NotionApiService) as jest.Mocked<NotionApiService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllDatabases', () => {
    it('should return all databases', async () => {
      // Arrange
      const databases = [
        createSampleDatabase('db-1', 'Database 1'),
        createSampleDatabase('db-2', 'Database 2')
      ];
      databaseRepository.findAll.mockResolvedValue(databases);

      // Act
      const result = await service.getAllDatabases();

      // Assert
      expect(databaseRepository.findAll).toHaveBeenCalled();
      expect(result.length).toBe(2);
      expect(result[0].id).toBe('db-1');
      expect(result[1].id).toBe('db-2');
    });

    it('should return empty array when no databases exist', async () => {
      // Arrange
      databaseRepository.findAll.mockResolvedValue([]);

      // Act
      const result = await service.getAllDatabases();

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('getDatabasesByWorkspace', () => {
    it('should return databases for a specific workspace', async () => {
      // Arrange
      const databases = [
        createSampleDatabase('db-1', 'Database 1'),
        createSampleDatabase('db-2', 'Database 2')
      ];
      databaseRepository.findByWorkspaceId.mockResolvedValue(databases);

      // Act
      const result = await service.getDatabasesByWorkspace('ws-1');

      // Assert
      expect(databaseRepository.findByWorkspaceId).toHaveBeenCalledWith('ws-1');
      expect(result.length).toBe(2);
    });
  });

  describe('getDatabaseById', () => {
    it('should return a database by id', async () => {
      // Arrange
      const database = createSampleDatabase('db-1', 'Database 1');
      databaseRepository.findById.mockResolvedValue(database);

      // Act
      const result = await service.getDatabaseById('db-1');

      // Assert
      expect(databaseRepository.findById).toHaveBeenCalledWith('db-1');
      expect(result.id).toBe('db-1');
      expect(result.title).toBe('Database 1');
    });

    it('should throw NotFoundException if database not found', async () => {
      // Arrange
      databaseRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.getDatabaseById('non-existent')).rejects
        .toThrow(NotFoundException);
      expect(databaseRepository.findById).toHaveBeenCalledWith('non-existent');
    });
  });

  describe('syncDatabase', () => {
    it('should sync database metadata and pages from Notion API', async () => {
      // Arrange
      const database = createSampleDatabase('db-1', 'Old Title');
      
      // Mock Notion API response with updated metadata
      const notionDatabaseResponse = {
        id: 'db-1',
        title: [{ plain_text: 'Updated Title' }],
        description: [{ plain_text: 'Updated description' }],
        url: 'https://notion.so/updated-url',
        // Add minimal required properties to satisfy type
        object: 'database',
        created_time: '2023-01-01T00:00:00.000Z',
        last_edited_time: '2023-01-01T00:00:00.000Z',
        properties: {},
        parent: { type: 'workspace', workspace: true }
      } as unknown as DatabaseObjectResponse;
      
      // Mock pages from Notion API
      const notionPagesResponse = [
        {
          id: 'page-1',
          url: 'https://notion.so/page-1',
          properties: {
            Name: {
              type: 'title',
              title: [{ plain_text: 'Page 1' }]
            }
          },
          created_time: '2023-01-01T00:00:00.000Z',
          last_edited_time: '2023-01-01T00:00:00.000Z',
          // Add minimal required properties to satisfy type
          object: 'page',
          parent: { type: 'database_id', database_id: 'db-1' },
          archived: false
        } as unknown as PageObjectResponse,
        {
          id: 'page-2',
          url: 'https://notion.so/page-2',
          properties: {
            Name: {
              type: 'title',
              title: [{ plain_text: 'Page 2' }]
            }
          },
          created_time: '2023-01-01T00:00:00.000Z',
          last_edited_time: '2023-01-01T00:00:00.000Z',
          // Add minimal required properties to satisfy type
          object: 'page',
          parent: { type: 'database_id', database_id: 'db-1' },
          archived: false
        } as unknown as PageObjectResponse
      ];
      
      // Set up mocks
      databaseRepository.findById.mockResolvedValue(database);
      notionApiService.getDatabase.mockResolvedValue(notionDatabaseResponse);
      notionApiService.queryDatabase.mockResolvedValue(notionPagesResponse);
      databaseRepository.save.mockResolvedValue(undefined);
      pageRepository.findById.mockResolvedValueOnce(null).mockResolvedValueOnce(null); // No existing pages
      pageRepository.save.mockResolvedValue(undefined);
      
      // Act
      const result = await service.syncDatabase('db-1');
      
      // Assert
      expect(databaseRepository.findById).toHaveBeenCalledWith('db-1');
      expect(notionApiService.getDatabase).toHaveBeenCalledWith('db-1');
      expect(notionApiService.queryDatabase).toHaveBeenCalledWith('db-1');
      
      // Verify database was updated
      expect(databaseRepository.save).toHaveBeenCalledTimes(2);
      const updatedDatabase = databaseRepository.save.mock.calls[0][0];
      expect(updatedDatabase.title).toBe('Updated Title');
      expect(updatedDatabase.description).toBe('Updated description');
      expect(updatedDatabase.url).toBe('https://notion.so/updated-url');
      
      // Verify new pages were created
      expect(pageRepository.save).toHaveBeenCalledTimes(2);
      
      // Verify result
      expect(result.databaseId).toBe('db-1');
      expect(result.newPages).toBe(2);
      expect(result.updatedPages).toBe(0);
      expect(result.totalPages).toBe(2);
    });

    it('should update existing pages when they have changed', async () => {
      // Arrange
      const database = createSampleDatabase('db-1', 'Database 1');
      const existingPage = createSamplePage('page-1', 'Old Title', 'db-1');
      
      // Mock Notion API response
      const notionDatabaseResponse = {
        id: 'db-1',
        title: [{ plain_text: 'Database 1' }],
        url: 'https://notion.so/db-1',
        // Add minimal required properties to satisfy type
        object: 'database',
        created_time: '2023-01-01T00:00:00.000Z',
        last_edited_time: '2023-01-01T00:00:00.000Z',
        properties: {},
        parent: { type: 'workspace', workspace: true }
      } as unknown as DatabaseObjectResponse;
      
      // Mock pages from Notion API with updated title
      const notionPagesResponse = [
        {
          id: 'page-1',
          url: 'https://notion.so/page-1',
          properties: {
            Name: {
              type: 'title',
              title: [{ plain_text: 'Updated Page Title' }]
            }
          },
          created_time: '2023-01-01T00:00:00.000Z',
          last_edited_time: '2023-01-01T00:00:00.000Z',
          // Add minimal required properties to satisfy type
          object: 'page',
          parent: { type: 'database_id', database_id: 'db-1' },
          archived: false
        } as unknown as PageObjectResponse
      ];
      
      // Set up mocks
      databaseRepository.findById.mockResolvedValue(database);
      notionApiService.getDatabase.mockResolvedValue(notionDatabaseResponse);
      notionApiService.queryDatabase.mockResolvedValue(notionPagesResponse);
      pageRepository.findById.mockResolvedValue(existingPage);
      
      // Act
      const result = await service.syncDatabase('db-1');
      
      // Assert
      expect(pageRepository.save).toHaveBeenCalledTimes(1);
      const updatedPage = pageRepository.save.mock.calls[0][0];
      expect(updatedPage.title).toBe('Updated Page Title');
      
      expect(result.updatedPages).toBe(1);
      expect(result.newPages).toBe(0);
    });

    it('should throw NotFoundException if database not found', async () => {
      // Arrange
      databaseRepository.findById.mockResolvedValue(null);
      
      // Act & Assert
      await expect(service.syncDatabase('non-existent')).rejects
        .toThrow(NotFoundException);
    });
  });
}); 