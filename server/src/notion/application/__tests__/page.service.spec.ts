import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PageService } from '../services/page.service';
import { INotionPageRepository } from '../../domain/repositories/notion-page.repository.interface';
import { INotionDatabaseRepository } from '../../domain/repositories/notion-database.repository.interface';
import { NotionApiService } from '../../infrastructure/api/notion-api.service';
import { NotionPage } from '../../domain/models/notion-page.entity';
import { PageProperty } from '../../domain/models/page-property.value-object';
import { Backlink } from '../../domain/models/backlink.value-object';
import { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';

describe('PageService', () => {
  let service: PageService;
  let pageRepository: jest.Mocked<INotionPageRepository>;
  let databaseRepository: jest.Mocked<INotionDatabaseRepository>;
  let notionApiService: jest.Mocked<NotionApiService>;

  // Helper function to create a sample page
  const createSamplePage = (
    id: string, 
    title: string, 
    databaseId: string,
    content: string = 'Sample content',
    properties: PageProperty[] = [],
    backlinks: Backlink[] = []
  ): NotionPage => {
    return new NotionPage({
      id,
      title,
      databaseId,
      url: `https://notion.so/${id}`,
      content,
      properties,
      backlinks,
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01')
    });
  };

  beforeEach(async () => {
    // Create mock repositories and services
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

    const mockDatabaseRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByWorkspaceId: jest.fn(),
      findByOwnerId: jest.fn(),
      save: jest.fn(),
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
        PageService,
        {
          provide: 'INotionPageRepository',
          useValue: mockPageRepository
        },
        {
          provide: 'INotionDatabaseRepository',
          useValue: mockDatabaseRepository
        },
        {
          provide: NotionApiService,
          useValue: mockNotionApiService
        }
      ],
    }).compile();

    service = module.get<PageService>(PageService);
    pageRepository = module.get('INotionPageRepository') as jest.Mocked<INotionPageRepository>;
    databaseRepository = module.get('INotionDatabaseRepository') as jest.Mocked<INotionDatabaseRepository>;
    notionApiService = module.get<NotionApiService>(NotionApiService) as jest.Mocked<NotionApiService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllPages', () => {
    it('should return all pages', async () => {
      // Arrange
      const pages = [
        createSamplePage('page-1', 'Page 1', 'db-1'),
        createSamplePage('page-2', 'Page 2', 'db-1')
      ];
      pageRepository.findAll.mockResolvedValue(pages);

      // Act
      const result = await service.getAllPages();

      // Assert
      expect(pageRepository.findAll).toHaveBeenCalled();
      expect(result.length).toBe(2);
      expect(result[0].id).toBe('page-1');
      expect(result[1].id).toBe('page-2');
    });

    it('should return empty array when no pages exist', async () => {
      // Arrange
      pageRepository.findAll.mockResolvedValue([]);

      // Act
      const result = await service.getAllPages();

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('getPagesByDatabaseId', () => {
    it('should return pages for a specific database', async () => {
      // Arrange
      const pages = [
        createSamplePage('page-1', 'Page 1', 'db-1'),
        createSamplePage('page-2', 'Page 2', 'db-1')
      ];
      pageRepository.findByDatabaseId.mockResolvedValue(pages);

      // Act
      const result = await service.getPagesByDatabaseId('db-1');

      // Assert
      expect(pageRepository.findByDatabaseId).toHaveBeenCalledWith('db-1');
      expect(result.length).toBe(2);
    });
  });

  describe('getPageById', () => {
    it('should return a page by id', async () => {
      // Arrange
      const page = createSamplePage('page-1', 'Page 1', 'db-1');
      pageRepository.findById.mockResolvedValue(page);

      // Act
      const result = await service.getPageById('page-1');

      // Assert
      expect(pageRepository.findById).toHaveBeenCalledWith('page-1');
      expect(result.id).toBe('page-1');
      expect(result.title).toBe('Page 1');
    });

    it('should throw NotFoundException if page not found', async () => {
      // Arrange
      pageRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.getPageById('non-existent')).rejects
        .toThrow(NotFoundException);
    });
  });

  describe('getPageWithBacklinks', () => {
    it('should return a page with its backlinks', async () => {
      // Arrange
      const backlink = new Backlink({
        id: 'bl-1',
        sourcePageId: 'source-page',
        sourcePageTitle: 'Source Page',
        targetPageId: 'page-1',
        createdAt: new Date('2023-01-01'),
        context: 'Link context'
      });
      
      const page = createSamplePage('page-1', 'Page 1', 'db-1', 'content', [], [backlink]);
      pageRepository.findWithBacklinks.mockResolvedValue(page);

      // Act
      const result = await service.getPageWithBacklinks('page-1');

      // Assert
      expect(pageRepository.findWithBacklinks).toHaveBeenCalledWith('page-1');
      expect(result.id).toBe('page-1');
      expect(result.backlinks).toHaveLength(1);
      expect(result.backlinks[0].sourcePageId).toBe('source-page');
    });

    it('should throw NotFoundException if page not found', async () => {
      // Arrange
      pageRepository.findWithBacklinks.mockResolvedValue(null);

      // Act & Assert
      await expect(service.getPageWithBacklinks('non-existent')).rejects
        .toThrow(NotFoundException);
    });
  });

  describe('getOutgoingBacklinks', () => {
    it('should return pages that are linked from the given page', async () => {
      // Arrange
      const pages = [
        createSamplePage('target-1', 'Target 1', 'db-1'),
        createSamplePage('target-2', 'Target 2', 'db-1')
      ];
      pageRepository.findOutgoingBacklinks.mockResolvedValue(pages);

      // Act
      const result = await service.getOutgoingBacklinks('source-page');

      // Assert
      expect(pageRepository.findOutgoingBacklinks).toHaveBeenCalledWith('source-page');
      expect(result.length).toBe(2);
    });
  });

  describe('syncPage', () => {
    it('should sync a page from Notion API and update content and properties', async () => {
      // Arrange
      const page = createSamplePage('page-1', 'Old Title', 'db-1', 'Old content');
      
      // Mock API responses
      const notionPageResponse = {
        id: 'page-1',
        properties: {
          Name: {
            type: 'title',
            title: [{ plain_text: 'Updated Title' }]
          }
        },
        url: 'https://notion.so/page-1',
        // Add required properties for type
        object: 'page',
        parent: { type: 'database_id', database_id: 'db-1' },
        created_time: '2023-01-01T00:00:00.000Z',
        last_edited_time: '2023-01-01T00:00:00.000Z',
        archived: false
      } as unknown as PageObjectResponse;
      
      const notionBlocksResponse = [
        {
          type: 'paragraph',
          paragraph: {
            rich_text: [{ plain_text: 'Updated content paragraph' }]
          }
        },
        {
          type: 'heading_1',
          heading_1: {
            rich_text: [{ plain_text: 'Updated heading' }]
          }
        }
      ];
      
      // Setup mocks
      pageRepository.findById.mockResolvedValue(page);
      notionApiService.getPage.mockResolvedValue(notionPageResponse);
      notionApiService.getPageBlocks.mockResolvedValue(notionBlocksResponse);
      pageRepository.save.mockResolvedValue(undefined);
      
      // Act
      const result = await service.syncPage('page-1');
      
      // Assert
      expect(pageRepository.findById).toHaveBeenCalledWith('page-1');
      expect(notionApiService.getPage).toHaveBeenCalledWith('page-1');
      expect(notionApiService.getPageBlocks).toHaveBeenCalledWith('page-1');
      
      // Verify page was updated with new content and title
      expect(pageRepository.save).toHaveBeenCalledTimes(1);
      const updatedPage = pageRepository.save.mock.calls[0][0];
      expect(updatedPage.title).toBe('Updated Title');
      expect(updatedPage.content).toContain('Updated content paragraph');
      expect(updatedPage.content).toContain('# Updated heading');
      
      // Check result
      expect(result.pageId).toBe('page-1');
      expect(result.contentUpdated).toBe(true);
      expect(result.propertiesUpdated).toBe(true);
    });

    it('should not update page if no changes detected', async () => {
      // Arrange
      // Create a page with a property that matches what will come from the API
      const titleProperty = new PageProperty({
        id: 'prop1',
        name: 'Name',
        type: 'title' as any,
        value: 'Unchanged Title'
      });
      
      const page = createSamplePage(
        'page-1', 
        'Unchanged Title', 
        'db-1', 
        'Unchanged content',
        [titleProperty]
      );
      
      // Mock API responses with same data
      const notionPageResponse = {
        id: 'page-1',
        properties: {
          Name: {
            id: 'prop1',
            type: 'title',
            title: [{ plain_text: 'Unchanged Title' }]
          }
        },
        url: 'https://notion.so/page-1',
        // Add required properties for type
        object: 'page',
        parent: { type: 'database_id', database_id: 'db-1' },
        created_time: '2023-01-01T00:00:00.000Z',
        last_edited_time: '2023-01-01T00:00:00.000Z',
        archived: false
      } as unknown as PageObjectResponse;
      
      const notionBlocksResponse = [
        {
          type: 'paragraph',
          paragraph: {
            rich_text: [{ plain_text: 'Unchanged content' }]
          }
        }
      ];
      
      // Setup mocks
      pageRepository.findById.mockResolvedValue(page);
      notionApiService.getPage.mockResolvedValue(notionPageResponse);
      notionApiService.getPageBlocks.mockResolvedValue(notionBlocksResponse);
      
      // Mock the private methods to ensure consistent behavior
      jest.spyOn(service as any, 'extractPlainTextFromBlocks').mockReturnValue('Unchanged content');
      jest.spyOn(service as any, 'extractPropertiesFromNotion').mockReturnValue([titleProperty]);
      
      // Act
      const result = await service.syncPage('page-1');
      
      // Assert - save should not be called since nothing changed
      expect(pageRepository.save).not.toHaveBeenCalled();
      expect(result.contentUpdated).toBe(false);
      expect(result.propertiesUpdated).toBe(false);
    });

    it('should throw NotFoundException if page not found', async () => {
      // Arrange
      pageRepository.findById.mockResolvedValue(null);
      
      // Act & Assert
      await expect(service.syncPage('non-existent')).rejects
        .toThrow(NotFoundException);
    });
  });

  // Test for private helper methods
  describe('extractPlainTextFromBlocks', () => {
    it('should extract text from blocks', async () => {
      // Access private method
      const extractMethod = (service as any).extractPlainTextFromBlocks;
      
      const blocks = [
        {
          type: 'paragraph',
          paragraph: {
            rich_text: [{ plain_text: 'Paragraph text' }]
          }
        },
        {
          type: 'heading_1',
          heading_1: {
            rich_text: [{ plain_text: 'Heading 1' }]
          }
        }
      ];
      
      const result = extractMethod.call(service, blocks);
      
      expect(result).toContain('Paragraph text');
      expect(result).toContain('# Heading 1');
    });
  });

  describe('extractPropertiesFromNotion', () => {
    it('should convert Notion properties to domain properties', async () => {
      // Access private method
      const extractMethod = (service as any).extractPropertiesFromNotion;
      
      const notionProperties = {
        Title: {
          id: 'prop1',
          type: 'title',
          title: [{ plain_text: 'Test Title' }]
        },
        Description: {
          id: 'prop2',
          type: 'rich_text',
          rich_text: [{ plain_text: 'Test Description' }]
        },
        Status: {
          id: 'prop3',
          type: 'select',
          select: { name: 'Active' }
        }
      };
      
      const result = extractMethod.call(service, notionProperties);
      
      expect(result).toHaveLength(3);
      expect(result[0].type).toBe('title');
      expect(result[0].value).toBe('Test Title');
      expect(result[1].type).toBe('rich_text');
      expect(result[1].value).toBe('Test Description');
      expect(result[2].type).toBe('select');
      expect(result[2].value).toBe('Active');
    });
  });
}); 