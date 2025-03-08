import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface RateLimitOptions {
  maxRequests: number;  // Maximum number of requests
  interval: number;     // Time interval in milliseconds
}

interface RateLimitState {
  timestamps: number[];
  waitPromise: Promise<void> | null;
}

@Injectable()
export class RateLimiterService {
  private readonly logger = new Logger(RateLimiterService.name);
  private state: RateLimitState = { timestamps: [], waitPromise: null };
  private options: RateLimitOptions;

  constructor(private readonly configService: ConfigService) {
    // Default rate limits: 3 requests per second (Notion's API limit is actually 3 requests per second)
    // These can be overridden by environment variables
    this.options = {
      maxRequests: this.configService.get<number>('NOTION_RATE_LIMIT_MAX_REQUESTS') || 3,
      interval: this.configService.get<number>('NOTION_RATE_LIMIT_INTERVAL') || 1000, // 1 second
    };

    this.logger.log(`Rate limiter initialized: ${this.options.maxRequests} requests per ${this.options.interval}ms`);
  }

  /**
   * Execute a function with rate limiting
   * @param fn Function to execute
   * @returns Result of the function execution
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    await this.acquireRateLimit();
    try {
      return await fn();
    } finally {
      this.releaseRateLimit();
    }
  }

  /**
   * Acquire a rate limit slot, waiting if necessary
   */
  private async acquireRateLimit(): Promise<void> {
    // Clean up old timestamps
    this.cleanupTimestamps();

    // If we've hit the limit, wait
    if (this.state.timestamps.length >= this.options.maxRequests) {
      const oldestTimestamp = this.state.timestamps[0];
      const waitTime = oldestTimestamp + this.options.interval - Date.now();
      
      if (waitTime > 0) {
        this.logger.debug(`Rate limit reached, waiting ${waitTime}ms`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }

    // Add current timestamp
    this.state.timestamps.push(Date.now());
  }

  /**
   * Release a rate limit slot (no-op in this implementation but could be extended)
   */
  private releaseRateLimit(): void {
    // This is a no-op as we're using a timestamp-based approach
  }

  /**
   * Clean up timestamps older than the interval
   */
  private cleanupTimestamps(): void {
    const now = Date.now();
    this.state.timestamps = this.state.timestamps.filter(
      timestamp => now - timestamp < this.options.interval
    );
  }
} 