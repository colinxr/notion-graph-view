import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

// Entities and Schemas
import { NotionDatabaseDocument, NotionDatabaseSchema } from './persistence/mongodb/notion-database.schema'
import { NotionPageDocument, NotionPageSchema, BacklinkDocument, BacklinkSchema } from './persistence/mongodb/notion-page.schema';

// Repositories
import { NotionDatabaseRepository } from './persistence/mongodb/notion-database.repository';
import { NotionPageRepository } from './persistence/mongodb/notion-page.repository';
import { BacklinkRepository } from './persistence/mongodb/notion-backlink.repository';

// API Services
import { NotionApiService } from './api/notion-api.service';
import { RateLimiterService } from './api/rate-limiter.service';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: NotionDatabaseDocument.name, schema: NotionDatabaseSchema },
      { name: NotionPageDocument.name, schema: NotionPageSchema },
      { name: BacklinkDocument.name, schema: BacklinkSchema },
    ]),
  ],
  providers: [
    // Repositories
    {
      provide: 'INotionDatabaseRepository',
      useClass: NotionDatabaseRepository,
    },
    {
      provide: 'INotionPageRepository',
      useClass: NotionPageRepository,
    },
    BacklinkRepository,
    
    // API Services
    RateLimiterService,
    NotionApiService,
  ],
  exports: [
    'INotionDatabaseRepository',
    'INotionPageRepository',
    BacklinkRepository,
    NotionApiService,
    RateLimiterService,
  ],
})
export class NotionInfrastructureModule {} 