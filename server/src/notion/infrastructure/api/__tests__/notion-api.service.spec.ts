import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { NotFoundException } from '@nestjs/common';
import { NotionApiService } from '../notion-api.service';
import { RateLimiterService } from '../rate-limiter.service';

// Mock the Notion client
jest.mock('@notionhq/client', () => {
  return {
    Client: jest.fn().mockImplementation(() => ({
      databases: {
        retrieve: jest.fn(),
        query: jest.fn(),
      },
      pages: {
        retrieve: jest.fn(),
      },
      blocks: {
        children: {
          list: jest.fn(),
        },
      },
      search: jest.fn(),
    })),
  };
});

describe('NotionApiService', () => {
  let service: NotionApiService;
  let configService: ConfigService;
  let rateLimiter: RateLimiterService;
  let mockClient: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotionApiService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('mock-api-key'),
          },
        },
        {
          provide: RateLimiterService,
          useValue: {
            execute: jest.fn((fn) => fn()),
          },
        },
      ],
    }).compile();

    service = module.get<NotionApiService>(NotionApiService);
    configService = module.get<ConfigService>(ConfigService);
    rateLimiter = module.get<RateLimiterService>(RateLimiterService);
    
    // Get the mocked client instance
    mockClient = (service as any).client;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('constructor', () => {
    it('should throw an error if API key is not defined', () => {
      jest.spyOn(configService, 'get').mockReturnValue(undefined);
      
      expect(() => new NotionApiService(configService, rateLimiter)).toThrow('NOTION_API_KEY is not defined');
    });
  });

  describe('getDatabase', () => {
    it('should retrieve a database by ID', async () => {
      const mockDatabase = { id: 'db-123', title: { plain_text: 'Test Database' } };
      mockClient.databases.retrieve.mockResolvedValue(mockDatabase);
      
      const result = await service.getDatabase('db-123');
      
      expect(mockClient.databases.retrieve).toHaveBeenCalledWith({ database_id: 'db-123' });
      expect(rateLimiter.execute).toHaveBeenCalled();
      expect(result).toEqual(mockDatabase);
    });

    it('should handle not found errors', async () => {
      const error: any = new Error('Database not found');
      error.code = 'object_not_found';
      mockClient.databases.retrieve.mockRejectedValue(error);
      
      await expect(service.getDatabase('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('queryDatabase', () => {
    it('should query a database and return pages', async () => {
      const mockPage = { id: 'page-123', properties: {} };
      const mockResponse = {
        results: [mockPage],
        has_more: false,
        next_cursor: null,
      };
      mockClient.databases.query.mockResolvedValue(mockResponse);
      
      const result = await service.queryDatabase('db-123');
      
      expect(mockClient.databases.query).toHaveBeenCalledWith({
        database_id: 'db-123',
        start_cursor: undefined,
      });
      expect(rateLimiter.execute).toHaveBeenCalled();
      expect(result).toEqual([mockPage]);
    });

    it('should handle pagination', async () => {
      const mockPage1 = { id: 'page-123', properties: {} };
      const mockPage2 = { id: 'page-456', properties: {} };
      
      // First response has more pages
      const mockResponse1 = {
        results: [mockPage1],
        has_more: true,
        next_cursor: 'cursor-1',
      };
      
      // Second response is the last page
      const mockResponse2 = {
        results: [mockPage2],
        has_more: false,
        next_cursor: null,
      };
      
      mockClient.databases.query
        .mockResolvedValueOnce(mockResponse1)
        .mockResolvedValueOnce(mockResponse2);
      
      const result = await service.queryDatabase('db-123');
      
      expect(mockClient.databases.query).toHaveBeenCalledTimes(2);
      expect(mockClient.databases.query).toHaveBeenNthCalledWith(1, {
        database_id: 'db-123',
        start_cursor: undefined,
      });
      expect(mockClient.databases.query).toHaveBeenNthCalledWith(2, {
        database_id: 'db-123',
        start_cursor: 'cursor-1',
      });
      expect(result).toEqual([mockPage1, mockPage2]);
    });
  });

  describe('getPage', () => {
    it('should retrieve a page by ID', async () => {
      const mockPage = { id: 'page-123', properties: {} };
      mockClient.pages.retrieve.mockResolvedValue(mockPage);
      
      const result = await service.getPage('page-123');
      
      expect(mockClient.pages.retrieve).toHaveBeenCalledWith({ page_id: 'page-123' });
      expect(rateLimiter.execute).toHaveBeenCalled();
      expect(result).toEqual(mockPage);
    });
  });

  describe('getPageBlocks', () => {
    it('should retrieve blocks for a page', async () => {
      const mockBlocks = [{ id: 'block-123', type: 'paragraph' }];
      const mockResponse = {
        results: mockBlocks,
        has_more: false,
        next_cursor: null,
      };
      mockClient.blocks.children.list.mockResolvedValue(mockResponse);
      
      const result = await service.getPageBlocks('page-123');
      
      expect(mockClient.blocks.children.list).toHaveBeenCalledWith({
        block_id: 'page-123',
        start_cursor: undefined,
      });
      expect(rateLimiter.execute).toHaveBeenCalled();
      expect(result).toEqual(mockBlocks);
    });

    it('should handle pagination for blocks', async () => {
      const mockBlock1 = { id: 'block-123', type: 'paragraph' };
      const mockBlock2 = { id: 'block-456', type: 'heading_1' };
      
      // First response has more blocks
      const mockResponse1 = {
        results: [mockBlock1],
        has_more: true,
        next_cursor: 'cursor-1',
      };
      
      // Second response is the last page
      const mockResponse2 = {
        results: [mockBlock2],
        has_more: false,
        next_cursor: null,
      };
      
      mockClient.blocks.children.list
        .mockResolvedValueOnce(mockResponse1)
        .mockResolvedValueOnce(mockResponse2);
      
      const result = await service.getPageBlocks('page-123');
      
      expect(mockClient.blocks.children.list).toHaveBeenCalledTimes(2);
      expect(mockClient.blocks.children.list).toHaveBeenNthCalledWith(1, {
        block_id: 'page-123',
        start_cursor: undefined,
      });
      expect(mockClient.blocks.children.list).toHaveBeenNthCalledWith(2, {
        block_id: 'page-123',
        start_cursor: 'cursor-1',
      });
      expect(result).toEqual([mockBlock1, mockBlock2]);
    });
  });

  describe('search', () => {
    it('should search for pages or databases', async () => {
      const mockResults = {
        results: [{ id: 'page-123', object: 'page' }],
        has_more: false,
        next_cursor: null,
      };
      mockClient.search.mockResolvedValue(mockResults);
      
      const result = await service.search('test query');
      
      expect(mockClient.search).toHaveBeenCalledWith({
        query: 'test query',
      });
      expect(rateLimiter.execute).toHaveBeenCalled();
      expect(result).toEqual(mockResults);
    });

    it('should pass additional options to search', async () => {
      const mockResults = {
        results: [{ id: 'page-123', object: 'page' }],
        has_more: false,
        next_cursor: null,
      };
      mockClient.search.mockResolvedValue(mockResults);
      
      const options = { filter: { property: 'object', value: 'page' } };
      const result = await service.search('test query', options);
      
      expect(mockClient.search).toHaveBeenCalledWith({
        query: 'test query',
        filter: { property: 'object', value: 'page' },
      });
      expect(result).toEqual(mockResults);
    });
  });
}); 