import { Module } from '@nestjs/common';
import { NotionInfrastructureModule } from '../infrastructure/notion-infrastructure.module';
import { DatabaseService } from './services/database.service';
import { PageService } from './services/page.service';
import { BacklinkExtractorService } from './services/backlink-extractor.service';

@Module({
  imports: [
    NotionInfrastructureModule,
  ],
  providers: [
    DatabaseService,
    PageService,
    BacklinkExtractorService,
  ],
  exports: [
    DatabaseService,
    PageService,
    BacklinkExtractorService,
  ],
})
export class NotionApplicationModule {} 