import { Test, TestingModule } from '@nestjs/testing';
import { BacklinkExtractorService } from '../services/backlink-extractor.service';
import { INotionPageRepository } from '../../domain/repositories/notion-page.repository.interface';
import { NotionPage } from '../../domain/models/notion-page.entity';
import { Backlink } from '../../domain/models/backlink.value-object';

// Mock uuid generation to make tests predictable
jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('mock-uuid')
}));

describe('BacklinkExtractorService', () => {
  let service: BacklinkExtractorService;
  let pageRepository: jest.Mocked<INotionPageRepository>;
  
  // Create sample pages for testing
  const createSamplePage = (id: string, title: string, content: string, backlinks: Backlink[] = []): NotionPage => {
    return new NotionPage({
      id,
      title,
      databaseId: 'db-1',
      url: `https://notion.so/${id}`,
      content,
      properties: [],
      backlinks,
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01')
    });
  };

  beforeEach(async () => {
    // Create mock repository
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

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BacklinkExtractorService,
        {
          provide: 'INotionPageRepository',
          useValue: mockPageRepository
        }
      ],
    }).compile();

    service = module.get<BacklinkExtractorService>(BacklinkExtractorService);
    pageRepository = module.get('INotionPageRepository') as jest.Mocked<INotionPageRepository>;

    // Mock the private extractContext method
    jest.spyOn(service as any, 'extractContext').mockImplementation((content, index, length) => {
      return "...context...";
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('extractBacklinksForAllPages', () => {
    it('should extract and save backlinks between pages', async () => {
      // Create sample pages with links between them
      const page1 = createSamplePage('page-1', 'First Page', 'This is a link to [[page-2]]');
      const page2 = createSamplePage('page-2', 'Second Page', 'This links back to [[page-1]] and also to [[page-3]]');
      const page3 = createSamplePage('page-3', 'Third Page', 'No links here');
      
      // Set up repository mock
      pageRepository.findAll.mockResolvedValue([page1, page2, page3]);
      pageRepository.save.mockResolvedValue(undefined);

      // Execute the method
      await service.extractBacklinksForAllPages();

      // Verify repository was called correctly
      expect(pageRepository.findAll).toHaveBeenCalledTimes(1);
      
      // We expect three save calls:
      // 1. For page-2 which has a backlink from page-1
      // 2. For page-1 which has a backlink from page-2
      // 3. For page-3 which has a backlink from page-2
      expect(pageRepository.save).toHaveBeenCalledTimes(3);
      
      // Check first save call arguments - this should be saving page-2 with a backlink from page-1
      const firstSaveCall = pageRepository.save.mock.calls[0][0];
      expect(firstSaveCall.id).toBe('page-2');
      expect(firstSaveCall.backlinks.length).toBe(1);
      expect(firstSaveCall.backlinks[0].sourcePageId).toBe('page-1');
      expect(firstSaveCall.backlinks[0].targetPageId).toBe('page-2');
      
      // Check second save call arguments - this should be saving page-1 with a backlink from page-2
      const secondSaveCall = pageRepository.save.mock.calls[1][0];
      expect(secondSaveCall.id).toBe('page-1');
      expect(secondSaveCall.backlinks.length).toBe(1);
      expect(secondSaveCall.backlinks[0].sourcePageId).toBe('page-2');
      expect(secondSaveCall.backlinks[0].targetPageId).toBe('page-1');
      
      // Check third save call arguments - this should be saving page-3 with a backlink from page-2
      const thirdSaveCall = pageRepository.save.mock.calls[2][0];
      expect(thirdSaveCall.id).toBe('page-3');
      expect(thirdSaveCall.backlinks.length).toBe(1);
      expect(thirdSaveCall.backlinks[0].sourcePageId).toBe('page-2');
      expect(thirdSaveCall.backlinks[0].targetPageId).toBe('page-3');
    });

    it('should handle pages with no links', async () => {
      const page1 = createSamplePage('page-1', 'First Page', 'No links here');
      const page2 = createSamplePage('page-2', 'Second Page', 'Also no links');
      
      pageRepository.findAll.mockResolvedValue([page1, page2]);
      
      await service.extractBacklinksForAllPages();
      
      expect(pageRepository.findAll).toHaveBeenCalledTimes(1);
      expect(pageRepository.save).not.toHaveBeenCalled();
    });

    it('should handle circular references', async () => {
      const page1 = createSamplePage('page-1', 'First Page', 'Link to [[page-2]]');
      const page2 = createSamplePage('page-2', 'Second Page', 'Link back to [[page-1]]');
      
      pageRepository.findAll.mockResolvedValue([page1, page2]);
      
      await service.extractBacklinksForAllPages();
      
      expect(pageRepository.save).toHaveBeenCalledTimes(2);
      
      // Check that both pages have backlinks
      const firstSavePage = pageRepository.save.mock.calls[0][0];
      const secondSavePage = pageRepository.save.mock.calls[1][0];
      
      expect(firstSavePage.backlinks.length).toBe(1);
      expect(secondSavePage.backlinks.length).toBe(1);
    });
  });

  describe('extractBacklinksForPage', () => {
    it('should extract backlinks to a specific page', async () => {
      const targetPage = createSamplePage('target-page', 'Target Page', 'No outgoing links');
      const sourcePage1 = createSamplePage('source-1', 'Source One', 'Link to [[target-page]]');
      const sourcePage2 = createSamplePage('source-2', 'Source Two', 'Another link to [[target-page]]');
      const unrelatedPage = createSamplePage('unrelated', 'Unrelated', 'No relevant links');
      
      pageRepository.findById.mockResolvedValue(targetPage);
      pageRepository.findAll.mockResolvedValue([targetPage, sourcePage1, sourcePage2, unrelatedPage]);
      
      const backlinkCount = await service.extractBacklinksForPage('target-page');
      
      expect(backlinkCount).toBe(2);
      expect(pageRepository.findById).toHaveBeenCalledWith('target-page');
      expect(pageRepository.findAll).toHaveBeenCalledTimes(1);
      expect(pageRepository.save).toHaveBeenCalledTimes(1);
      
      // Verify the saved page has the correct backlinks
      const savedPage = pageRepository.save.mock.calls[0][0];
      expect(savedPage.id).toBe('target-page');
      expect(savedPage.backlinks.length).toBe(2);
      
      // Check backlink sources 
      const sourceIds = savedPage.backlinks.map(b => b.sourcePageId).sort();
      expect(sourceIds).toEqual(['source-1', 'source-2']);
    });

    it('should handle a page with no incoming links', async () => {
      const targetPage = createSamplePage('target-page', 'Target Page', 'No links');
      const otherPage = createSamplePage('other-page', 'Other Page', 'No links to target');
      
      pageRepository.findById.mockResolvedValue(targetPage);
      pageRepository.findAll.mockResolvedValue([targetPage, otherPage]);
      
      const backlinkCount = await service.extractBacklinksForPage('target-page');
      
      expect(backlinkCount).toBe(0);
      expect(pageRepository.save).toHaveBeenCalledTimes(1);
      
      // The page should be saved with empty backlinks
      const savedPage = pageRepository.save.mock.calls[0][0];
      expect(savedPage.backlinks.length).toBe(0);
    });

    it('should throw an error if the page is not found', async () => {
      pageRepository.findById.mockResolvedValue(null);
      
      await expect(service.extractBacklinksForPage('non-existent')).rejects
        .toThrow('Page with ID non-existent not found');
      
      expect(pageRepository.findAll).not.toHaveBeenCalled();
    });
  });

  // Test the link extraction from content
  describe('extractLinksFromContent', () => {
    it('should extract wiki-style links', async () => {
      // Access the private method using type casting to any
      const extractLinksMethod = (service as any).extractLinksFromContent;
      
      const content = 'Here is a link to [[page-123]] and another to [[page-456]].';
      const sourcePageId = 'source-page';
      
      const result = extractLinksMethod.call(service, content, sourcePageId);
      
      expect(result.length).toBe(2);
      expect(result[0].targetPageId).toBe('page-123');
      expect(result[1].targetPageId).toBe('page-456');
      expect(result[0].sourcePageId).toBe(sourcePageId);
    });

    it('should extract markdown-style links', async () => {
      const extractLinksMethod = (service as any).extractLinksFromContent;
      
      const content = 'Check out [Link text](page-123) and [Another](page-456)';
      const sourcePageId = 'source-page';
      
      const result = extractLinksMethod.call(service, content, sourcePageId);
      
      expect(result.length).toBe(2);
      expect(result[0].targetPageId).toBe('page-123');
      expect(result[0].context).toBe('Link text');
      expect(result[1].targetPageId).toBe('page-456');
      expect(result[1].context).toBe('Another');
    });

    it('should ignore links to the source page itself', async () => {
      const extractLinksMethod = (service as any).extractLinksFromContent;
      
      const content = 'Self link [[self-page]] and normal link [[other-page]]';
      const sourcePageId = 'self-page';
      
      const result = extractLinksMethod.call(service, content, sourcePageId);
      
      expect(result.length).toBe(1);
      expect(result[0].targetPageId).toBe('other-page');
    });

    it('should handle empty content', async () => {
      const extractLinksMethod = (service as any).extractLinksFromContent;
      
      const result = extractLinksMethod.call(service, '', 'source-page');
      expect(result.length).toBe(0);
      
      const nullResult = extractLinksMethod.call(service, null, 'source-page');
      expect(nullResult.length).toBe(0);
    });
  });

  // Test context extraction
  describe('extractContext', () => {
    it('should extract context around a link', async () => {
      // Restore the original implementation for this test
      jest.spyOn(service as any, 'extractContext').mockRestore();
      
      const extractContextMethod = (service as any).extractContext;
      
      const content = 'This is some text with a link in the middle of the paragraph.';
      const linkIndex = 27; // "link" starts at index 27
      const linkLength = 4;  // "link" is 4 characters
      
      const context = extractContextMethod.call(service, content, linkIndex, linkLength);
      
      // Should include text before and after with ellipsis
      expect(context).toContain('...This is some text with a');
      expect(context).toContain('in the middle of the paragraph...');
    });
  });
}); 