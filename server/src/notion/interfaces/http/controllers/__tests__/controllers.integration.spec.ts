import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, NotFoundException, MiddlewareConsumer, NestModule } from '@nestjs/common';
import * as request from 'supertest';
import { Request, Response, NextFunction } from 'express';
import { NotionDatabaseController } from '../notion-database.controller';
import { NotionPageController } from '../notion-page.controller';
import { DatabaseService } from '../../../../application/services/database.service';
import { PageService } from '../../../../application/services/page.service';
import { BacklinkExtractorService } from '../../../../application/services/backlink-extractor.service';
import { NotionDatabaseDto } from '../../../../application/dtos/database.dto';
import { NotionPageDto, PageSyncResultDto } from '../../../../application/dtos/page.dto';
import { BacklinkDto } from '../../../../application/dtos/backlink.dto';
import { ConfigModule } from '@nestjs/config';
import { AuthGuard } from '../../../../../iam/interfaces/http/guards/auth.guard';
import { SubscriptionGuard } from '../../../../../iam/interfaces/http/guards/subscription.guard';
import { UserDto } from '../../../../../iam/application/dtos/user.dto';

// Create mock Logger module
const LoggerModule = {
  module: class {},
  providers: [
    {
      provide: 'LoggerService',
      useValue: {
        log: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn(),
      },
    },
  ],
};

// Create a user middleware that adds a mock user to every request
class UserMiddleware implements NestModule {
  private readonly mockUser: UserDto;

  constructor(mockUser: UserDto) {
    this.mockUser = mockUser;
  }

  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply((req: Request, res: Response, next: NextFunction) => {
        (req as any).user = this.mockUser;
        next();
      })
      .forRoutes('*');
  }
}

describe('Notion Controllers (Integration)', () => {
  let app: INestApplication;
  let databaseService: DatabaseService;
  let pageService: PageService;
  let backlinkExtractorService: BacklinkExtractorService;

  // Utility function to convert Date objects to their string representation for comparison
  const toJsonSafe = <T>(obj: T): T => JSON.parse(JSON.stringify(obj));

  // Mock data with fixed dates that won't change during test execution
  const fixedDate = new Date('2023-01-01T00:00:00.000Z');
  
  const mockUser: UserDto = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    isAuthenticated: true,
    hasNotionAccess: true,
    createdAt: fixedDate,
    updatedAt: fixedDate
  };

  const mockBacklink: BacklinkDto = {
    id: 'bl-123',
    sourcePageId: 'page-456',
    sourcePageTitle: 'Source Page',
    targetPageId: 'page-123',
    createdAt: fixedDate,
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
    createdAt: fixedDate,
    updatedAt: fixedDate,
  };

  const mockDatabase: NotionDatabaseDto = {
    id: 'db-123',
    title: 'Test Database',
    workspaceId: 'ws-123',
    ownerId: 'owner-123',
    lastSyncedAt: fixedDate,
    createdAt: fixedDate,
    updatedAt: fixedDate,
  };

  const mockSyncResult: PageSyncResultDto = {
    pageId: 'page-123',
    databaseId: 'db-123',
    backlinkCount: 1,
    contentUpdated: true,
    propertiesUpdated: false,
    syncedAt: fixedDate,
  };

  const mockDatabaseSyncResult = {
    databaseId: 'db-123',
    newPages: 2,
    updatedPages: 3,
    totalPages: 5,
    syncedAt: fixedDate,
  };

  beforeAll(async () => {
    // Create mock services
    const mockDatabaseService = {
      getAllDatabases: jest.fn().mockResolvedValue([mockDatabase]),
      getDatabasesByWorkspace: jest.fn().mockResolvedValue([mockDatabase]),
      getDatabaseById: jest.fn().mockImplementation((id) => {
        if (id === 'db-123') {
          return Promise.resolve(mockDatabase);
        }
        return Promise.reject(new NotFoundException('Database not found'));
      }),
      syncDatabase: jest.fn().mockResolvedValue(mockDatabaseSyncResult),
    };

    const mockPageService = {
      getAllPages: jest.fn().mockResolvedValue([mockPage]),
      getPagesByDatabaseId: jest.fn().mockResolvedValue([mockPage]),
      getPageById: jest.fn().mockImplementation((id) => {
        if (id === 'page-123') {
          return Promise.resolve(mockPage);
        }
        return Promise.reject(new NotFoundException('Page not found'));
      }),
      getPageWithBacklinks: jest.fn().mockResolvedValue(mockPage),
      getOutgoingBacklinks: jest.fn().mockResolvedValue([mockPage]),
      syncPage: jest.fn().mockResolvedValue(mockSyncResult),
    };

    const mockBacklinkExtractorService = {
      extractBacklinksForPage: jest.fn().mockResolvedValue(5),
    };
    
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
      ],
      controllers: [NotionDatabaseController, NotionPageController],
      providers: [
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
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

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    
    // Hook into the Express app to add the user to every request
    // This is the key fix - add user to all requests via middleware
    app.use((req: Request, res: Response, next: NextFunction) => {
      (req as any).user = mockUser;
      next();
    });
    
    databaseService = moduleFixture.get<DatabaseService>(DatabaseService);
    pageService = moduleFixture.get<PageService>(PageService);
    backlinkExtractorService = moduleFixture.get<BacklinkExtractorService>(BacklinkExtractorService);
    
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('DatabaseController', () => {
    describe('GET /notion/databases', () => {
      it('should return all databases', () => {
        return request(app.getHttpServer())
          .get('/notion/databases')
          .expect(200)
          .expect((res) => {
            expect(res.body).toEqual(toJsonSafe([mockDatabase]));
          });
      });
    });

    describe('GET /notion/databases/:id', () => {
      it('should return a database by ID', () => {
        return request(app.getHttpServer())
          .get('/notion/databases/db-123')
          .expect(200)
          .expect((res) => {
            expect(res.body).toEqual(toJsonSafe(mockDatabase));
          });
      });

      it('should return 404 when database not found', () => {
        return request(app.getHttpServer())
          .get('/notion/databases/not-found')
          .expect(404);
      });
    });

    describe('POST /notion/databases/:id/sync', () => {
      it('should sync a database and return results', () => {
        return request(app.getHttpServer())
          .post('/notion/databases/db-123/sync')
          .expect(200)
          .expect((res) => {
            expect(res.body).toEqual(toJsonSafe(mockDatabaseSyncResult));
          });
      });
    });
  });

  describe('PageController', () => {
    describe('GET /notion/pages', () => {
      it('should return all pages', () => {
        return request(app.getHttpServer())
          .get('/notion/pages')
          .expect(200)
          .expect((res) => {
            expect(res.body).toEqual(toJsonSafe([mockPage]));
          });
      });

      it('should return pages filtered by database ID', () => {
        return request(app.getHttpServer())
          .get('/notion/pages?database=db-123')
          .expect(200)
          .expect((res) => {
            expect(res.body).toEqual(toJsonSafe([mockPage]));
          });
      });
    });

    describe('GET /notion/pages/:id', () => {
      it('should return a page by ID', () => {
        return request(app.getHttpServer())
          .get('/notion/pages/page-123')
          .expect(200)
          .expect((res) => {
            expect(res.body).toEqual(toJsonSafe(mockPage));
          });
      });

      it('should return 404 when page not found', () => {
        return request(app.getHttpServer())
          .get('/notion/pages/not-found')
          .expect(404);
      });
    });

    describe('GET /notion/pages/:id/with-backlinks', () => {
      it('should return a page with its backlinks', () => {
        return request(app.getHttpServer())
          .get('/notion/pages/page-123/with-backlinks')
          .expect(200)
          .expect((res) => {
            expect(res.body).toEqual(toJsonSafe(mockPage));
          });
      });
    });

    describe('GET /notion/pages/:id/outgoing-backlinks', () => {
      it('should return pages that are linked from the source page', () => {
        return request(app.getHttpServer())
          .get('/notion/pages/page-123/outgoing-backlinks')
          .expect(200)
          .expect((res) => {
            expect(res.body).toEqual(toJsonSafe([mockPage]));
          });
      });
    });

    describe('POST /notion/pages/:id/sync', () => {
      it('should sync a page and return results', () => {
        return request(app.getHttpServer())
          .post('/notion/pages/page-123/sync')
          .expect(200)
          .expect((res) => {
            expect(res.body).toEqual(toJsonSafe(mockSyncResult));
          });
      });
    });

    describe('POST /notion/pages/:id/extract-backlinks', () => {
      it('should extract backlinks for a page and return count', () => {
        return request(app.getHttpServer())
          .post('/notion/pages/page-123/extract-backlinks')
          .expect(200)
          .expect({
            pageId: 'page-123',
            backlinkCount: 5
          });
      });
    });
  });
}); 