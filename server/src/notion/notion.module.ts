import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';

// Controllers
import { NotionDatabaseController } from './interfaces/http/controllers/notion-database.controller';
import { NotionPageController } from './interfaces/http/controllers/notion-page.controller';

// Services
import { DatabaseService } from './application/services/database.service';
import { PageService } from './application/services/page.service';
import { BacklinkExtractorService } from './application/services/backlink-extractor.service';
import { NotionApiService } from './infrastructure/api/notion-api.service';
import { RateLimiterService } from './infrastructure/api/rate-limiter.service';

// Entities and Schemas
import { NotionDatabaseDocument, NotionDatabaseSchema } from './infrastructure/persistence/mongodb/notion-database.schema';
import { NotionPageDocument, NotionPageSchema, BacklinkDocument, BacklinkSchema } from './infrastructure/persistence/mongodb/notion-page.schema';

// Repositories
import { NotionDatabaseRepository } from './infrastructure/persistence/mongodb/notion-database.repository';
import { NotionPageRepository } from './infrastructure/persistence/mongodb/notion-page.repository';
import { BacklinkRepository } from './infrastructure/persistence/mongodb/notion-backlink.repository';

// Guards
import { AuthGuard } from '../iam/interfaces/http/guards/auth.guard';
import { SubscriptionGuard } from '../iam/interfaces/http/guards/subscription.guard';

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
      { name: BacklinkDocument.name, schema: BacklinkSchema },
    ]),
    HttpModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '24h' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [
    NotionDatabaseController,
    NotionPageController,
  ],
  providers: [
    // Services
    DatabaseService,
    PageService,
    BacklinkExtractorService,
    NotionApiService,
    RateLimiterService,
    
    // Repositories
    BacklinkRepository,
    AuthGuard,
    SubscriptionGuard,
    {
      provide: 'INotionDatabaseRepository',
      useClass: NotionDatabaseRepository,
    },
    {
      provide: 'INotionPageRepository',
      useClass: NotionPageRepository,
    },
  ],
  exports: [
    DatabaseService,
    PageService,
    BacklinkExtractorService,
    NotionApiService,
    RateLimiterService,
    'INotionDatabaseRepository',
    'INotionPageRepository',
  ],
})
export class NotionModule {} 