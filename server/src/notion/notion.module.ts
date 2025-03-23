import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { NotionDatabaseController } from './interfaces/http/controllers/notion-database.controller';
import { DatabaseService } from './application/services/database.service';
import { DatabaseCacheService } from './application/services/database-cache.service';
import { NotionApiService } from './infrastructure/api/notion-api.service';
import { RateLimiterService } from './infrastructure/api/rate-limiter.service';
import { DatabaseCacheHandler } from './application/handlers/database-cache.handler';
import { BacklinkExtractorService } from './application/services/backlink-extractor.service';
import { RedisModule } from '../shared/infrastructure/caching/redis/redis.module';
import { EventBusModule } from '../shared/infrastructure/event-bus/event-bus.module';
import { IAMModule } from '../iam/iam.module';

// Database schemas
import { NotionDatabaseDocument, NotionDatabaseSchema } from './infrastructure/persistence/mongodb/notion-database.schema';
import { NotionPageDocument, NotionPageSchema } from './infrastructure/persistence/mongodb/notion-page.schema';

// Repository implementations
import { NotionDatabaseRepository } from './infrastructure/persistence/mongodb/notion-database.repository';
import { NotionPageRepository } from './infrastructure/persistence/mongodb/notion-page.repository';

/**
 * Notion Module provides integration with Notion API
 * and local storage of Notion entities
 */
@Module({
  imports: [
    // Register Mongoose models
    MongooseModule.forFeature([
      { name: NotionPageDocument.name, schema: NotionPageSchema },
      { name: NotionDatabaseDocument.name, schema: NotionDatabaseSchema },
    ]),
    ConfigModule,
    RedisModule,
    EventBusModule,
    IAMModule
  ],
  controllers: [NotionDatabaseController],
  providers: [
    // Services
    DatabaseService,
    DatabaseCacheService,
    NotionApiService,
    RateLimiterService,
    BacklinkExtractorService,
    
    // Event handlers
    DatabaseCacheHandler,
    
    // Repositories
    {
      provide: 'INotionDatabaseRepository',
      useClass: NotionDatabaseRepository,
    },
    {
      provide: 'INotionPageRepository',
      useClass: NotionPageRepository,
    },
    {
      provide: 'BacklinkExtractorService',
      useClass: BacklinkExtractorService,
    },
  ],
  exports: [
    NotionApiService,
    DatabaseService,
    DatabaseCacheService,
    'INotionDatabaseRepository',
    'INotionPageRepository',
    'BacklinkExtractorService',
  ],
})
export class NotionModule {} 