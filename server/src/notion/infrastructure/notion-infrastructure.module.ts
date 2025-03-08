import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

// Entities and Schemas
import { NotionDatabase, NotionDatabaseSchema } from '../infrastructure/entities/database.entity';
import { NotionPage, NotionPageSchema } from '../infrastructure/entities/page.entity';
import { Backlink, BacklinkSchema } from '../infrastructure/entities/backlink.entity';

// Repositories
import { NotionDatabaseRepository } from './persistence/mongodb/notion-database.repository';
import { NotionPageRepository } from './persistence/mongodb/notion-page.repository';
import { BacklinkRepository } from './persistence/mongodb/backlink.repository';

// API Services
import { NotionApiService } from './api/notion-api.service';
import { RateLimiterService } from './api/rate-limiter.service';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: NotionDatabase.name, schema: NotionDatabaseSchema },
      { name: NotionPage.name, schema: NotionPageSchema },
      { name: Backlink.name, schema: BacklinkSchema },
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