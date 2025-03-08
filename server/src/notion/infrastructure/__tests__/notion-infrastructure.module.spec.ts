import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { NotionInfrastructureModule } from '../notion-infrastructure.module';
import { NotionDatabaseRepository } from '../persistence/mongodb/notion-database.repository';
import { NotionPageRepository } from '../persistence/mongodb/notion-page.repository';
import { NotionApiService } from '../api/notion-api.service';
import { RateLimiterService } from '../api/rate-limiter.service';
import { MongoMemoryServer } from 'mongodb-memory-server';

describe('NotionInfrastructureModule', () => {
  let module: TestingModule;
  let mongod: MongoMemoryServer;

  beforeAll(async () => {
    // Create in-memory MongoDB instance for testing
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    // Create a test module with real MongoDB in-memory
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        MongooseModule.forRoot(uri),
        NotionInfrastructureModule,
      ],
    }).compile();
  });

  afterAll(async () => {
    if (module) {
      await module.close();
    }
    if (mongod) {
      await mongod.stop();
    }
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should provide the database repository', async () => {
    console.log(module)
    const repository = module.get('INotionDatabaseRepository');
    expect(repository).toBeInstanceOf(NotionDatabaseRepository);
  });

  it('should provide the page repository', async () => {
    const repository = module.get('INotionPageRepository');
    expect(repository).toBeInstanceOf(NotionPageRepository);
  });

  it('should provide the Notion API service', async () => {
    const service = module.get(NotionApiService);
    expect(service).toBeInstanceOf(NotionApiService);
  });

  it('should provide the rate limiter service', async () => {
    const service = module.get(RateLimiterService);
    expect(service).toBeInstanceOf(RateLimiterService);
  });
}); 