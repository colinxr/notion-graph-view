import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../../../shared/infrastructure/caching/redis/redis.service';
import { CachedDatabasesListDto } from '../dtos/database-cache.dto';
import { EventBusService } from '../../../shared/infrastructure/event-bus/event-bus.service';
import { DatabasesFetchedEvent } from '../../domain/events/database-fetched.event';
import { NotionDatabaseDto } from '../dtos/database.dto';

@Injectable()
export class DatabaseCacheService {
  private readonly logger = new Logger(DatabaseCacheService.name);
  
  constructor(
    private readonly redisService: RedisService,
    private readonly eventBus: EventBusService,
  ) {}
  
  /**
   * Get cached databases for a user
   * Returns null if the cache doesn't exist
   */
  async getCachedDatabases(userId: string): Promise<CachedDatabasesListDto | null> {
    const cacheKey = this.getUserDatabasesCacheKey(userId);
    this.logger.debug(`Fetching databases from cache for user ${userId}`);
    
    try {
      return await this.redisService.get<CachedDatabasesListDto>(cacheKey, true);
    } catch (error) {
      this.logger.error(`Error fetching cached databases for user ${userId}`, error);
      return null;
    }
  }
  
  /**
   * Triggers an async cache update event
   * This won't block the execution flow
   */
  async triggerDatabaseCacheUpdate(userId: string, databases: NotionDatabaseDto[]): Promise<void> {
    const cacheKey = this.getUserDatabasesCacheKey(userId);
    this.logger.debug(`Publishing database caching event for user ${userId} with key ${cacheKey}`);
    
    try {
      const event = new DatabasesFetchedEvent(userId, databases, cacheKey);
      // Use Promise.resolve to fire and forget
      Promise.resolve(this.eventBus.publish(event)).catch(error => 
        this.logger.error(`Error publishing database cache event: ${error.message}`)
      );
    } catch (error) {
      this.logger.error(`Failed to trigger cache update for user ${userId}`, error);
    }
  }
  
  /**
   * Get the Redis cache key for a user's databases
   */
  public getUserDatabasesCacheKey(userId: string): string {
    return `user:${userId}:databases`;
  }
} 