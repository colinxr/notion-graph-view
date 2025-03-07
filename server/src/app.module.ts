import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongoDBModule } from './shared/infrastructure/persistence/mongodb/mongodb.module';
import { RedisModule } from './shared/infrastructure/caching/redis/redis.module';
import { LoggerService } from './shared/infrastructure/logging/logger.service';
import { EventBusModule } from './shared/infrastructure/event-bus/event-bus.module';
import { IAMModule } from './iam/iam.module';

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
  ],
  providers: [
    LoggerService,
  ],
  exports: [
    LoggerService,
  ],
})
export class AppModule {} 