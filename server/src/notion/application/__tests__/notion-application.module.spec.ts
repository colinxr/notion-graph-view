import { Test } from '@nestjs/testing';
import { NotionApplicationModule } from '../notion-application.module';
import { DatabaseService } from '../services/database.service';
import { PageService } from '../services/page.service';
import { BacklinkExtractorService } from '../services/backlink-extractor.service';

// Define mock classes
class MockDatabaseService {}
class MockPageService {}
class MockBacklinkExtractorService {}

// Mock dependencies
jest.mock('../../infrastructure/notion-infrastructure.module', () => ({
  NotionInfrastructureModule: class MockInfrastructureModule {},
}));

jest.mock('../services/database.service', () => ({
  DatabaseService: MockDatabaseService,
}));

jest.mock('../services/page.service', () => ({
  PageService: MockPageService,
}));

jest.mock('../services/backlink-extractor.service', () => ({
  BacklinkExtractorService: MockBacklinkExtractorService,
}));

describe('NotionApplicationModule', () => {
  it('should compile the module', async () => {
    const module = await Test.createTestingModule({
      imports: [NotionApplicationModule],
    }).compile();

    expect(module).toBeDefined();
  });

  it('should provide DatabaseService', async () => {
    const module = await Test.createTestingModule({
      imports: [NotionApplicationModule],
    }).compile();

    const service = module.get(DatabaseService);
    expect(service).toBeInstanceOf(MockDatabaseService);
  });

  it('should provide PageService', async () => {
    const module = await Test.createTestingModule({
      imports: [NotionApplicationModule],
    }).compile();

    const service = module.get(PageService);
    expect(service).toBeInstanceOf(MockPageService);
  });

  it('should provide BacklinkExtractorService', async () => {
    const module = await Test.createTestingModule({
      imports: [NotionApplicationModule],
    }).compile();

    const service = module.get(BacklinkExtractorService);
    expect(service).toBeInstanceOf(MockBacklinkExtractorService);
  });
}); 