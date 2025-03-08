import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';

// Controllers
import { DatabaseController } from './interfaces/http/controllers/database.controller';
import { PageController } from './interfaces/http/controllers/page.controller';

// Services
import { DatabaseService } from './application/services/database.service';
import { PageService } from './application/services/page.service';
import { BacklinkExtractorService } from './application/services/backlink-extractor.service';
import { NotionApiService } from './application/services/notion-api.service';

// Entities and Schemas
import { NotionDatabase, NotionDatabaseSchema } from './infrastructure/entities/database.entity';
import { NotionPage, NotionPageSchema } from './infrastructure/entities/page.entity';
import { Backlink, BacklinkSchema } from './infrastructure/entities/backlink.entity';

// Repositories
import { BacklinkRepository } from './infrastructure/persistence/mongodb/backlink.repository';
// Note: Add the actual repository imports once they are created
// import { NotionDatabaseRepository } from './infrastructure/persistence/mongodb/notion-database.repository';
// import { NotionPageRepository } from './infrastructure/persistence/mongodb/notion-page.repository';

/**
 * Notion Module provides integration with Notion API
 * and local storage of Notion entities
 */
@Module({
  imports: [
    // Register Mongoose models
    MongooseModule.forFeature([
      { name: NotionDatabase.name, schema: NotionDatabaseSchema },
      { name: NotionPage.name, schema: NotionPageSchema },
      { name: Backlink.name, schema: BacklinkSchema },
    ]),
    HttpModule,
    ConfigModule,
  ],
  controllers: [
    DatabaseController,
    PageController,
  ],
  providers: [
    // Services
    DatabaseService,
    PageService,
    BacklinkExtractorService,
    NotionApiService,
    
    // Repositories
    BacklinkRepository,
    // Add these when implemented
    // NotionDatabaseRepository,
    // NotionPageRepository,
  ],
  exports: [
    DatabaseService,
    PageService,
    BacklinkExtractorService,
    NotionApiService,
  ],
})
export class NotionModule {} 