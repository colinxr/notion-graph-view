import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

// Schemas
import { NotionDatabaseDocument, NotionDatabaseSchema } from './persistence/mongodb/notion-database.schema';
import { NotionPageDocument, NotionPageSchema } from './persistence/mongodb/notion-page.schema';

// Repositories
import { NotionDatabaseRepository } from './persistence/mongodb/notion-database.repository';
import { NotionPageRepository } from './persistence/mongodb/notion-page.repository';

// API Services
import { NotionApiService } from './api/notion-api.service';
import { RateLimiterService } from './api/rate-limiter.service';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: NotionDatabaseDocument.name, schema: NotionDatabaseSchema },
      { name: NotionPageDocument.name, schema: NotionPageSchema },
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
    
    // API Services
    RateLimiterService,
    NotionApiService,
  ],
  exports: [
    'INotionDatabaseRepository',
    'INotionPageRepository',
    NotionApiService,
    RateLimiterService,
  ],
})
export class NotionInfrastructureModule {} 