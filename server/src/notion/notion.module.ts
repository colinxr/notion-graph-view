import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from '../logger/logger.module';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

// Controllers
import { DatabaseController } from './interfaces/http/controllers/database.controller';
import { PageController } from './interfaces/http/controllers/page.controller';

// Services
import { DatabaseService } from './application/services/database.service';
import { PageService } from './application/services/page.service';
import { BacklinkExtractorService } from './application/services/backlink-extractor.service';
import { NotionApiService } from './application/services/notion-api.service';

// Repositories
import { DatabaseRepository } from './infrastructure/repositories/database.repository';
import { PageRepository } from './infrastructure/repositories/page.repository';
import { BacklinkRepository } from './infrastructure/repositories/backlink.repository';

// Entities
import { NotionDatabase } from './infrastructure/entities/database.entity';
import { NotionPage } from './infrastructure/entities/page.entity';
import { Backlink } from './infrastructure/entities/backlink.entity';

/**
 * Notion Module aggregates all components related to Notion integration.
 * It provides API controllers for database and page operations.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([NotionDatabase, NotionPage, Backlink]),
    HttpModule,
    LoggerModule,
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
    DatabaseRepository,
    PageRepository,
    BacklinkRepository,
  ],
  exports: [
    DatabaseService,
    PageService,
    BacklinkExtractorService,
    NotionApiService,
  ],
})
export class NotionModule {} 