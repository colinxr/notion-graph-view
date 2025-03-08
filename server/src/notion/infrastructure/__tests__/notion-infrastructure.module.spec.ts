import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';

// Repositories and interfaces
import { NotionDatabaseRepository } from '../persistence/mongodb/notion-database.repository';
import { NotionPageRepository } from '../persistence/mongodb/notion-page.repository';
import { BacklinkRepository } from '../persistence/mongodb/notion-backlink.repository';

// Services
import { NotionApiService } from '../api/notion-api.service';
import { RateLimiterService } from '../api/rate-limiter.service';

// Create mock implementations
const mockNotionDatabaseRepository = {
  findAll: jest.fn(),
  findById: jest.fn(),
  findByWorkspaceId: jest.fn(),
  findByOwnerId: jest.fn(),
  save: jest.fn(),
  delete: jest.fn()
};

const mockNotionPageRepository = {
  findAll: jest.fn(),
  findById: jest.fn(),
  findByDatabaseId: jest.fn(),
  findWithBacklinks: jest.fn(),
  findOutgoingBacklinks: jest.fn(),
  save: jest.fn(),
  delete: jest.fn()
};

const mockBacklinkRepository = {
  create: jest.fn(),
  findByTargetPageId: jest.fn(),
  findBySourcePageId: jest.fn(),
  deleteBySourcePageId: jest.fn()
};

const mockNotionApiService = {
  listDatabases: jest.fn(),
  getDatabase: jest.fn(),
  queryDatabase: jest.fn(),
  getPage: jest.fn(),
  getPageContent: jest.fn()
};

const mockRateLimiterService = {
  rateLimit: jest.fn()
};

describe('Notion Infrastructure Components', () => {
  let module: TestingModule;

  beforeAll(async () => {
    // Create a test module with all mocked dependencies
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        HttpModule,
      ],
      providers: [
        // Provide mocked implementations
        {
          provide: NotionDatabaseRepository,
          useValue: mockNotionDatabaseRepository
        },
        {
          provide: NotionPageRepository,
          useValue: mockNotionPageRepository
        },
        {
          provide: BacklinkRepository,
          useValue: mockBacklinkRepository
        },
        {
          provide: NotionApiService,
          useValue: mockNotionApiService
        },
        {
          provide: RateLimiterService,
          useValue: mockRateLimiterService
        },
        
        // Register interface tokens
        {
          provide: 'INotionDatabaseRepository',
          useValue: mockNotionDatabaseRepository
        },
        {
          provide: 'INotionPageRepository',
          useValue: mockNotionPageRepository
        },
      ],
    }).compile();
  });

  afterAll(async () => {
    if (module) {
      await module.close();
    }
  });

  describe('Database Repository', () => {
    it('should be defined', () => {
      const repository = module.get(NotionDatabaseRepository);
      expect(repository).toBeDefined();
    });
  });

  describe('Page Repository', () => {
    it('should be defined', () => {
      const repository = module.get(NotionPageRepository);
      expect(repository).toBeDefined();
    });
  });

  describe('Backlink Repository', () => {
    it('should be defined', () => {
      const repository = module.get(BacklinkRepository);
      expect(repository).toBeDefined();
    });
  });

  describe('Notion API Service', () => {
    it('should be defined', () => {
      const service = module.get(NotionApiService);
      expect(service).toBeDefined();
    });
  });

  describe('Rate Limiter Service', () => {
    it('should be defined', () => {
      const service = module.get(RateLimiterService);
      expect(service).toBeDefined();
    });
  });

  describe('Interface Repositories', () => {
    it('should provide database repository via interface token', () => {
      const repository = module.get('INotionDatabaseRepository');
      expect(repository).toBeDefined();
      expect(repository).toHaveProperty('findAll');
      expect(repository).toHaveProperty('findById');
    });

    it('should provide page repository via interface token', () => {
      const repository = module.get('INotionPageRepository');
      expect(repository).toBeDefined();
      expect(repository).toHaveProperty('findAll');
      expect(repository).toHaveProperty('findById');
    });
  });
}); 