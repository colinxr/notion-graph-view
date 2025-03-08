import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppModule } from '../src/app.module';
import { NotionModule } from '../src/notion/notion.module';
import { NotionDatabase } from '../src/notion/infrastructure/entities/database.entity';
import { NotionPage } from '../src/notion/infrastructure/entities/page.entity';
import { Backlink } from '../src/notion/infrastructure/entities/backlink.entity';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

describe('Notion API (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let databaseRepository: Repository<NotionDatabase>;
  let pageRepository: Repository<NotionPage>;
  let backlinkRepository: Repository<Backlink>;
  let authToken: string;
  let createdDatabaseId: string;
  let createdPageId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        // Use the actual modules but with test configurations
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            type: 'sqlite',
            database: ':memory:',
            entities: [NotionDatabase, NotionPage, Backlink],
            synchronize: true,
          }),
        }),
        NotionModule,
        JwtModule.registerAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            secret: 'test-secret',
            signOptions: { expiresIn: '1h' },
          }),
        }),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());

    jwtService = moduleFixture.get<JwtService>(JwtService);
    databaseRepository = moduleFixture.get<Repository<NotionDatabase>>(
      getRepositoryToken(NotionDatabase),
    );
    pageRepository = moduleFixture.get<Repository<NotionPage>>(
      getRepositoryToken(NotionPage),
    );
    backlinkRepository = moduleFixture.get<Repository<Backlink>>(
      getRepositoryToken(Backlink),
    );

    await app.init();

    // Generate a JWT token for authentication
    authToken = jwtService.sign({
      sub: 'test-user-id',
      email: 'test@example.com',
      name: 'Test User',
      isAuthenticated: true,
      hasNotionAccess: true,
    });

    // Seed the database with test data
    await seedTestData();
  });

  // Helper to seed test data
  async function seedTestData() {
    // Create a test database
    const database = databaseRepository.create({
      title: 'E2E Test Database',
      workspaceId: 'ws-e2e-test',
      ownerId: 'test-user-id',
      lastSyncedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const savedDatabase = await databaseRepository.save(database);
    createdDatabaseId = savedDatabase.id;

    // Create a test page
    const page = pageRepository.create({
      title: 'E2E Test Page',
      databaseId: createdDatabaseId,
      content: 'This is a test page with a [[link]]',
      url: 'https://notion.so/test-page',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const savedPage = await pageRepository.save(page);
    createdPageId = savedPage.id;

    // Create a test backlink
    const backlink = backlinkRepository.create({
      sourcePageId: 'some-other-page-id',
      sourcePageTitle: 'Source Page',
      targetPageId: createdPageId,
      context: 'Text with [[E2E Test Page]]',
      createdAt: new Date(),
    });
    await backlinkRepository.save(backlink);
  }

  afterAll(async () => {
    await app.close();
  });

  describe('Database Controller', () => {
    it('GET /notion/databases - should return all databases', () => {
      return request(app.getHttpServer())
        .get('/notion/databases')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toBeInstanceOf(Array);
          expect(res.body.length).toBeGreaterThan(0);
          expect(res.body[0]).toHaveProperty('id', createdDatabaseId);
          expect(res.body[0]).toHaveProperty('title', 'E2E Test Database');
        });
    });

    it('GET /notion/databases/:id - should return a specific database', () => {
      return request(app.getHttpServer())
        .get(`/notion/databases/${createdDatabaseId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', createdDatabaseId);
          expect(res.body).toHaveProperty('title', 'E2E Test Database');
        });
    });

    it('GET /notion/databases/:id - should return 404 for non-existent database', () => {
      return request(app.getHttpServer())
        .get('/notion/databases/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('Page Controller', () => {
    it('GET /notion/pages - should return all pages', () => {
      return request(app.getHttpServer())
        .get('/notion/pages')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toBeInstanceOf(Array);
          expect(res.body.length).toBeGreaterThan(0);
          expect(res.body[0]).toHaveProperty('id', createdPageId);
          expect(res.body[0]).toHaveProperty('title', 'E2E Test Page');
        });
    });

    it('GET /notion/pages?database=:id - should return pages filtered by database ID', () => {
      return request(app.getHttpServer())
        .get(`/notion/pages?database=${createdDatabaseId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toBeInstanceOf(Array);
          expect(res.body.length).toBeGreaterThan(0);
          expect(res.body[0]).toHaveProperty('databaseId', createdDatabaseId);
        });
    });

    it('GET /notion/pages/:id - should return a specific page', () => {
      return request(app.getHttpServer())
        .get(`/notion/pages/${createdPageId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', createdPageId);
          expect(res.body).toHaveProperty('title', 'E2E Test Page');
        });
    });

    it('GET /notion/pages/:id/with-backlinks - should return a page with its backlinks', () => {
      return request(app.getHttpServer())
        .get(`/notion/pages/${createdPageId}/with-backlinks`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', createdPageId);
          expect(res.body).toHaveProperty('backlinks');
          expect(res.body.backlinks).toBeInstanceOf(Array);
          expect(res.body.backlinks.length).toBeGreaterThan(0);
        });
    });

    it('POST /notion/pages/:id/extract-backlinks - should extract backlinks', () => {
      return request(app.getHttpServer())
        .post(`/notion/pages/${createdPageId}/extract-backlinks`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('pageId', createdPageId);
          expect(res.body).toHaveProperty('backlinkCount');
        });
    });
  });

  describe('Authentication', () => {
    it('should reject requests without authentication', () => {
      return request(app.getHttpServer())
        .get('/notion/databases')
        .expect(401);
    });

    it('should reject requests with invalid token', () => {
      return request(app.getHttpServer())
        .get('/notion/databases')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });
}); 