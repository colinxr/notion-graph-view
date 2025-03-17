import { Injectable, Logger } from '@nestjs/common';
import { EventHandler } from '../../../shared/infrastructure/event-bus/decorators/event-handler.decorator';
import { IEventHandler } from '../../../shared/infrastructure/event-bus/interfaces/event-handler.interface';
import { DatabasesFetchedEvent } from '../../domain/events/database-fetched.event';
import { RedisService } from '../../../shared/infrastructure/caching/redis/redis.service';
import { CachedDatabaseDto, CachedDatabasesListDto } from '../dtos/database-cache.dto';

@Injectable()
@EventHandler(DatabasesFetchedEvent.EVENT_NAME)
export class DatabaseCacheHandler implements IEventHandler<DatabasesFetchedEvent> {
  private readonly logger = new Logger(DatabaseCacheHandler.name);
  private readonly CACHE_TTL_SECONDS = 3600; // 1 hour cache TTL
  
  constructor(private readonly redisService: RedisService) {}
  
  async handle(event: DatabasesFetchedEvent): Promise<void> {
    try {
      this.logger.log(`Caching ${event.databases.length} databases for user ${event.userId} with key ${event.cacheKey}`);
      
      // Create the cached databases DTO
      const cachedDatabases: CachedDatabaseDto[] = event.databases.map(db => ({
        id: db.id,
        title: db.title,
        url: db.url,
        icon: undefined, // Extract icon if available in future
        cachedAt: new Date(),
      }));
      
      const cacheData: CachedDatabasesListDto = {
        databases: cachedDatabases,
        cachedAt: new Date(),
      };
      
      // Cache the databases list using the provided cache key
      await this.redisService.set(event.cacheKey, cacheData, this.CACHE_TTL_SECONDS);
      
      this.logger.log(`Successfully cached databases for user ${event.userId}`);
    } catch (error) {
      this.logger.error(
        `Failed to cache databases for user ${event.userId}`,
        error instanceof Error ? error.stack : undefined
      );
    }
  }
} 