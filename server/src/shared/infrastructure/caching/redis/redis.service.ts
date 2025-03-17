import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;
  private readonly logger = new Logger(RedisService.name);

  constructor(private configService: ConfigService) {
    this.client = new Redis({
      host: this.configService.get('REDIS_HOST', 'localhost'),
      port: this.configService.get('REDIS_PORT', 6379),
    });
    
    this.logger.log(`Redis client configured: ${this.configService.get('REDIS_HOST', 'localhost')}:${this.configService.get('REDIS_PORT', 6379)}`);
  }

  async onModuleInit() {
    // Verify Redis connection on startup
    try {
      await this.client.ping();
      this.logger.log('Redis connection verified');
    } catch (error) {
      this.logger.error('Redis connection failed', error);
      throw new Error('Redis connection failed');
    }
  }

  async onModuleDestroy() {
    await this.client.quit();
    this.logger.log('Redis connection closed');
  }

  getClient(): Redis {
    return this.client;
  }
  
  /**
   * Set a value in Redis with an optional TTL in seconds
   */
  async set(key: string, value: string | object, ttlInSeconds?: number): Promise<void> {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    
    if (ttlInSeconds) {
      await this.client.set(key, stringValue, 'EX', ttlInSeconds);
    } else {
      await this.client.set(key, stringValue);
    }
  }
  
  /**
   * Get a value from Redis
   * Returns null if key doesn't exist
   */
  async get<T = string>(key: string, parseJson = false): Promise<T | null> {
    const value = await this.client.get(key);
    
    if (!value) {
      return null;
    }
    
    if (parseJson) {
      try {
        return JSON.parse(value) as T;
      } catch (error) {
        this.logger.error(`Failed to parse Redis value as JSON: ${value}`, error);
        return null;
      }
    }
    
    return value as unknown as T;
  }
  
  /**
   * Delete a key from Redis
   */
  async delete(key: string): Promise<void> {
    await this.client.del(key);
  }
  
  /**
   * Check if a key exists in Redis
   */
  async exists(key: string): Promise<boolean> {
    const exists = await this.client.exists(key);
    return exists === 1;
  }
  
  /**
   * Set an expiration time on a key
   */
  async expire(key: string, ttlInSeconds: number): Promise<void> {
    await this.client.expire(key, ttlInSeconds);
  }
} 