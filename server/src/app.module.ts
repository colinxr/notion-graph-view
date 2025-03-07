import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongoDBModule } from './shared/infrastructure/persistence/mongodb/mongodb.module';
import { RedisModule } from './shared/infrastructure/caching/redis/redis.module';
import { LoggerService } from './shared/infrastructure/logging/logger.service';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    
    // Infrastructure
    MongoDBModule,
    RedisModule,
  ],
  providers: [
    LoggerService,
  ],
  exports: [
    LoggerService,
  ],
})
export class AppModule {} 