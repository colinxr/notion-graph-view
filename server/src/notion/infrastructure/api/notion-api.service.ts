import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RateLimiterService } from './rate-limiter.service';
import { Client } from '@notionhq/client';
import { 
  DatabaseObjectResponse, 
  PageObjectResponse, 
  QueryDatabaseParameters,
  ListBlockChildrenResponse,
  SearchResponse
} from '@notionhq/client/build/src/api-endpoints';

/**
 * NotionApiService provides a wrapper around the official Notion API client
 * with additional features like rate limiting and error handling
 */
@Injectable()
export class NotionApiService {
  private readonly logger = new Logger(NotionApiService.name);
  private readonly client: Client;

  constructor(
    private readonly configService: ConfigService,
    private readonly rateLimiter: RateLimiterService,
  ) {
    const apiKey = this.configService.get<string>('NOTION_CLIENT_SECRET');
    if (!apiKey) {
      throw new Error('NOTION_CLIENT_SECRET is not defined');
    }

    this.client = new Client({
      auth: apiKey,
    });

    this.logger.log('NotionApiService initialized');
  }

  /**
   * Retrieve a database by ID
   * @param databaseId The ID of the database to retrieve
   * @returns Database object
   */
  async getDatabase(databaseId: string): Promise<DatabaseObjectResponse> {
    try {
      const response = await this.rateLimiter.execute(() => 
        this.client.databases.retrieve({ database_id: databaseId })
      );
      
      // Ensure we have a full database object response
      if (!('title' in response)) {
        throw new Error('Received incomplete database object from Notion API');
      }
      
      return response as DatabaseObjectResponse;
    } catch (error) {
      this.handleApiError('getDatabase', databaseId, error);
      throw error;
    }
  }

  /**
   * Get all databases the user has access to
   * @returns Array of database objects
   */
  async getAllDatabases(): Promise<DatabaseObjectResponse[]> {
    try {
      this.logger.log('Fetching all databases from Notion');
      
      const allDatabases: DatabaseObjectResponse[] = [];
      let hasMore = true;
      let startCursor: string | undefined = undefined;
      
      // Paginate through all results
      while (hasMore) {
        const response = await this.rateLimiter.execute(() =>
          this.client.search({
            filter: { property: 'object', value: 'database' },
            start_cursor: startCursor,
            page_size: 100, // Maximum allowed by Notion API
          })
        );
        
        const typedResponse = response as SearchResponse;
        
        // Filter and add database objects to the result array
        const databases = typedResponse.results
          .filter((item): item is DatabaseObjectResponse => 
            item.object === 'database' && 'title' in item
          );
        
        allDatabases.push(...databases);
        
        hasMore = typedResponse.has_more;
        startCursor = typedResponse.next_cursor ?? undefined;
      }
      
      this.logger.log(`Found ${allDatabases.length} databases`);
      return allDatabases;
    } catch (error) {
      this.handleApiError('getAllDatabases', '', error);
      throw error;
    }
  }

  /**
   * Query a database for its pages
   * @param databaseId The ID of the database to query
   * @param params Optional query parameters
   * @returns List of pages
   */
  async queryDatabase(
    databaseId: string, 
    params: Omit<QueryDatabaseParameters, 'database_id'> = {}
  ): Promise<PageObjectResponse[]> {
    try {
      const allPages: PageObjectResponse[] = [];
      let hasMore = true;
      let startCursor: string | undefined = undefined;

      // Paginate through all results
      while (hasMore) {
        const response = await this.rateLimiter.execute(() =>
          this.client.databases.query({
            database_id: databaseId,
            start_cursor: startCursor,
            ...params,
          })
        );

        // Filter results to only include full page objects (not partial ones)
        const typedResponse = response as {
          results: Array<PageObjectResponse>;
          has_more: boolean;
          next_cursor: string | null;
        };

        allPages.push(
          ...typedResponse.results.filter(
            (page: any): page is PageObjectResponse => 'properties' in page
          )
        );

        hasMore = typedResponse.has_more;
        startCursor = typedResponse.next_cursor ?? undefined;
      }

      return allPages;
    } catch (error) {
      this.handleApiError('queryDatabase', databaseId, error);
      throw error;
    }
  }

  /**
   * Retrieve a page by ID
   * @param pageId The ID of the page to retrieve
   * @returns Page object
   */
  async getPage(pageId: string): Promise<PageObjectResponse> {
    try {
      return await this.rateLimiter.execute(() => 
        this.client.pages.retrieve({ page_id: pageId })
      ) as PageObjectResponse;
    } catch (error) {
      this.handleApiError('getPage', pageId, error);
      throw error;
    }
  }

  /**
   * Retrieve the content blocks of a page
   * @param blockId The ID of the block (usually same as page ID)
   * @returns List of block objects
   */
  async getPageBlocks(blockId: string): Promise<any[]> {
    try {
      const allBlocks: any[] = [];
      let hasMore = true;
      let startCursor: string | undefined = undefined;

      // Paginate through all blocks
      while (hasMore) {
        const response = await this.rateLimiter.execute(() =>
          this.client.blocks.children.list({
            block_id: blockId,
            start_cursor: startCursor,
          })
        );

        const typedResponse = response as ListBlockChildrenResponse;
        allBlocks.push(...typedResponse.results);
        
        hasMore = typedResponse.has_more;
        startCursor = typedResponse.next_cursor ?? undefined;
      }

      return allBlocks;
    } catch (error) {
      this.handleApiError('getPageBlocks', blockId, error);
      throw error;
    }
  }

  /**
   * Search for pages or databases in a workspace
   * @param query Search query text
   * @param options Search options
   * @returns Search results
   */
  async search(query: string, options: any = {}): Promise<SearchResponse> {
    try {
      return await this.rateLimiter.execute(() =>
        this.client.search({
          query,
          ...options,
        })
      ) as SearchResponse;
    } catch (error) {
      this.handleApiError('search', query, error);
      throw error;
    }
  }

  /**
   * Handle API errors with appropriate logging and error wrapping
   */
  private handleApiError(method: string, id: string, error: any): void {
    if (error.code === 'object_not_found') {
      this.logger.error(`${method} failed: Object not found - ${id}`);
      throw new NotFoundException(`Notion ${method.replace(/^get/, '')} not found: ${id}`);
    }

    this.logger.error(`${method} failed for ${id}: ${error.message}`, error.stack);
    
    // Re-throw the original error after logging
    throw error;
  }
} 