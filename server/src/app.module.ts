import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongoDBModule } from './shared/infrastructure/persistence/mongodb/mongodb.module';
import { RedisModule } from './shared/infrastructure/caching/redis/redis.module';
import { LoggerService } from './shared/infrastructure/logging/logger.service';
import { EventBusModule } from './shared/infrastructure/event-bus/event-bus.module';
import { IAMModule } from './iam/iam.module';
import { NotionModule } from './notion/notion.module';
import { DocsModule } from './docs/docs.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    
    // Infrastructure
    MongoDBModule,
    RedisModule,
    EventBusModule,
    
    // Application Modules
    IAMModule,
    NotionModule,
    DocsModule,
  ],
  providers: [
    LoggerService,
  ],
  exports: [
    LoggerService,
  ],
})
export class AppModule {} 