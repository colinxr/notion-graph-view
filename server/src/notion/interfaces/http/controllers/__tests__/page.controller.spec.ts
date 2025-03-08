import { Test, TestingModule } from '@nestjs/testing';
import { PageController } from '../page.controller';
import { PageService } from '../../../../application/services/page.service';
import { BacklinkExtractorService } from '../../../../application/services/backlink-extractor.service';
import { NotionPageDto, PageSyncResultDto } from '../../../../application/dtos/page.dto';
import { NotFoundException } from '@nestjs/common';
import { BacklinkDto } from '../../../../application/dtos/backlink.dto';
import { AuthGuard } from '../../../../../iam/interfaces/http/guards/auth.guard';
import { SubscriptionGuard } from '../../../../../iam/interfaces/http/guards/subscription.guard';

describe('PageController', () => {
  let controller: PageController;
  let pageService: jest.Mocked<PageService>;
  let backlinkExtractorService: jest.Mocked<BacklinkExtractorService>;

  // Mock data
  const mockBacklink: BacklinkDto = {
    id: 'bl-123',
    sourcePageId: 'page-456',
    sourcePageTitle: 'Source Page',
    targetPageId: 'page-123',
    createdAt: new Date(),
    context: 'Link context',
  };

  const mockPage: NotionPageDto = {
    id: 'page-123',
    title: 'Test Page',
    databaseId: 'db-123',
    url: 'https://notion.so/page-123',
    content: 'Test content with [[page-456]]',
    properties: [],
    backlinks: [mockBacklink],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockSyncResult: PageSyncResultDto = {
    pageId: 'page-123',
    databaseId: 'db-123',
    backlinkCount: 1,
    contentUpdated: true,
    propertiesUpdated: false,
    syncedAt: new Date(),
  };

  beforeEach(async () => {
    // Create mock services with Jest mock functions
    const mockPageService = {
      getAllPages: jest.fn().mockResolvedValue([mockPage]),
      getPagesByDatabaseId: jest.fn().mockResolvedValue([mockPage]),
      getPageById: jest.fn().mockResolvedValue(mockPage),
      getPageWithBacklinks: jest.fn().mockResolvedValue(mockPage),
      getOutgoingBacklinks: jest.fn().mockResolvedValue([mockPage]),
      syncPage: jest.fn().mockResolvedValue(mockSyncResult),
    };

    const mockBacklinkExtractorService = {
      extractBacklinksForPage: jest.fn().mockResolvedValue(5),
      extractBacklinksForAllPages: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PageController],
      providers: [
        {
          provide: PageService,
          useValue: mockPageService,
        },
        {
          provide: BacklinkExtractorService,
          useValue: mockBacklinkExtractorService,
        },
      ],
    })
    .overrideGuard(AuthGuard)
    .useValue({ canActivate: () => true })
    .overrideGuard(SubscriptionGuard)
    .useValue({ canActivate: () => true })
    .compile();

    controller = module.get<PageController>(PageController);
    pageService = module.get(PageService) as jest.Mocked<PageService>;
    backlinkExtractorService = module.get(BacklinkExtractorService) as jest.Mocked<BacklinkExtractorService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getPages', () => {
    it('should return all pages when no database ID is provided', async () => {
      // Act
      const result = await controller.getPages();

      // Assert
      expect(pageService.getAllPages).toHaveBeenCalled();
      expect(pageService.getPagesByDatabaseId).not.toHaveBeenCalled();
      expect(result).toEqual([mockPage]);
    });

    it('should return pages filtered by database ID when provided', async () => {
      // Arrange
      const databaseId = 'db-123';

      // Act
      const result = await controller.getPages(databaseId);

      // Assert
      expect(pageService.getPagesByDatabaseId).toHaveBeenCalledWith(databaseId);
      expect(pageService.getAllPages).not.toHaveBeenCalled();
      expect(result).toEqual([mockPage]);
    });
  });

  describe('getPage', () => {
    it('should return a page by ID', async () => {
      // Arrange
      const pageId = 'page-123';

      // Act
      const result = await controller.getPage(pageId);

      // Assert
      expect(pageService.getPageById).toHaveBeenCalledWith(pageId);
      expect(result).toEqual(mockPage);
    });

    it('should throw NotFoundException when page not found', async () => {
      // Arrange
      const pageId = 'non-existent';
      pageService.getPageById.mockRejectedValueOnce(new NotFoundException());

      // Act & Assert
      await expect(controller.getPage(pageId)).rejects.toThrow(NotFoundException);
      expect(pageService.getPageById).toHaveBeenCalledWith(pageId);
    });
  });

  describe('getPageWithBacklinks', () => {
    it('should return a page with its backlinks', async () => {
      // Arrange
      const pageId = 'page-123';

      // Act
      const result = await controller.getPageWithBacklinks(pageId);

      // Assert
      expect(pageService.getPageWithBacklinks).toHaveBeenCalledWith(pageId);
      expect(result).toEqual(mockPage);
      expect(result.backlinks).toHaveLength(1);
    });

    it('should throw NotFoundException when page not found', async () => {
      // Arrange
      const pageId = 'non-existent';
      pageService.getPageWithBacklinks.mockRejectedValueOnce(new NotFoundException());

      // Act & Assert
      await expect(controller.getPageWithBacklinks(pageId)).rejects.toThrow(NotFoundException);
      expect(pageService.getPageWithBacklinks).toHaveBeenCalledWith(pageId);
    });
  });

  describe('getOutgoingBacklinks', () => {
    it('should return pages that are linked from the source page', async () => {
      // Arrange
      const sourcePageId = 'page-123';

      // Act
      const result = await controller.getOutgoingBacklinks(sourcePageId);

      // Assert
      expect(pageService.getOutgoingBacklinks).toHaveBeenCalledWith(sourcePageId);
      expect(result).toEqual([mockPage]);
    });
  });

  describe('syncPage', () => {
    it('should sync page and return result', async () => {
      // Arrange
      const pageId = 'page-123';

      // Act
      const result = await controller.syncPage(pageId);

      // Assert
      expect(pageService.syncPage).toHaveBeenCalledWith(pageId);
      expect(result).toEqual(mockSyncResult);
    });

    it('should throw NotFoundException when page not found', async () => {
      // Arrange
      const pageId = 'non-existent';
      pageService.syncPage.mockRejectedValueOnce(new NotFoundException());

      // Act & Assert
      await expect(controller.syncPage(pageId)).rejects.toThrow(NotFoundException);
      expect(pageService.syncPage).toHaveBeenCalledWith(pageId);
    });
  });

  describe('extractBacklinks', () => {
    it('should extract backlinks for a page and return count', async () => {
      // Arrange
      const pageId = 'page-123';
      const backlinkCount = 5;

      // Act
      const result = await controller.extractBacklinks(pageId);

      // Assert
      expect(backlinkExtractorService.extractBacklinksForPage).toHaveBeenCalledWith(pageId);
      expect(result).toEqual({ pageId, backlinkCount });
    });

    it('should throw error when page not found', async () => {
      // Arrange
      const pageId = 'non-existent';
      backlinkExtractorService.extractBacklinksForPage.mockRejectedValueOnce(new Error('Page not found'));

      // Act & Assert
      await expect(controller.extractBacklinks(pageId)).rejects.toThrow('Page not found');
      expect(backlinkExtractorService.extractBacklinksForPage).toHaveBeenCalledWith(pageId);
    });
  });
}); 