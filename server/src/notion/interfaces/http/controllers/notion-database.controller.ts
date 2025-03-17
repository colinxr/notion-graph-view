import { 
  Controller, 
  Get, 
  Param, 
  Post,
  UseGuards,
  HttpStatus,
  HttpCode,
  Logger,
  Req
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam, 
  ApiCookieAuth,
  ApiHeader
} from '@nestjs/swagger';
import { DatabaseService } from '../../../application/services/database.service';
import { DatabaseCacheService } from '../../../application/services/database-cache.service';
import { NotionApiService } from '../../../infrastructure/api/notion-api.service';
import { NotionDatabaseDto, DatabaseSyncResultDto } from '../../../application/dtos/database.dto';
import { CachedDatabasesListDto } from '../../../application/dtos/database-cache.dto';
import { ClerkAuthGuard } from '../../../../iam/interfaces/http/guards/clerk-auth.guard';
import { SubscriptionGuard } from '../../../../iam/interfaces/http/guards/subscription.guard';
import { Request } from 'express';
import { EventBusService } from '../../../../shared/infrastructure/event-bus/event-bus.service';
import { DatabasesFetchedEvent } from '../../../domain/events/database-fetched.event';

// Extend Request type to include auth properties
interface RequestWithAuth extends Request {
  auth: {
    userId: string;
    notionAccessToken: string;
    sessionId: string;
  };
}

/**
 * Controller for handling Notion database operations
 * 
 * Provides endpoints for:
 * - Listing all databases for authenticated users with Redis caching
 * - Retrieving a specific database by ID
 * - Syncing a database with Notion to update its content
 */
@ApiTags('notion-databases')
@ApiCookieAuth('__session') // Clerk session cookie
@Controller('notion/databases')
@UseGuards(ClerkAuthGuard)
export class NotionDatabaseController {
  private readonly logger = new Logger(NotionDatabaseController.name);

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly databaseCacheService: DatabaseCacheService,
    private readonly notionApiService: NotionApiService,
    private readonly eventBus: EventBusService
  ) {}

  /**
   * Retrieve all databases for the authenticated user
   * First checks Redis cache, then falls back to Notion API
   */
  @Get()
  @ApiOperation({ 
    summary: 'Get all databases for the authenticated user',
    description: 'Returns a list of Notion databases the user has access to.' 
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'List of databases returned successfully', 
    type: [NotionDatabaseDto] 
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED, 
    description: 'Not authenticated' 
  })
  @ApiResponse({ 
    status: HttpStatus.FORBIDDEN, 
    description: 'Not authorized (subscription required)' 
  })
  async getDatabases(@Req() request: RequestWithAuth): Promise<NotionDatabaseDto[]> {
    // Extract user ID and access token from Clerk auth
    const userId = request.auth.userId;
    const notionAccessToken = request.auth.notionAccessToken;
    
    this.logger.log(`Getting databases for user ${userId}`);
    
    // Try to get databases from Redis cache first
    const cacheKey = this.databaseCacheService.getUserDatabasesCacheKey(userId);
    const cachedData = await this.databaseCacheService.getCachedDatabases(userId);
    
    if (cachedData) {
      this.logger.debug(`Using cached databases for user ${userId}`);
      return this.mapCachedToFullDtos(cachedData);
    }
    
    // If not in cache, get directly from Notion API using the dedicated method
    this.logger.debug(`Cache miss for user ${userId}, fetching from Notion API`);
    
    // Get all databases using our dedicated method
    const notionDatabases = await this.notionApiService.getAllDatabases();
    
    // Map database objects to DTOs
    const databases = notionDatabases.map(db => this.mapNotionDatabaseToDto(db));
    
    // Publish event to cache data asynchronously (fire and forget)
    Promise.resolve(this.eventBus.publish(new DatabasesFetchedEvent(userId, databases, cacheKey)))
      .catch(error => this.logger.error(`Error publishing cache event: ${error.message}`));
    
    return databases;
  }

  /**
   * Retrieve a specific database by its ID
   */
  @Get(':id')
  @ApiOperation({ 
    summary: 'Get a specific database by ID',
    description: 'Returns detailed information about a single Notion database.' 
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Database returned successfully', 
    type: NotionDatabaseDto 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Database not found' 
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED, 
    description: 'Not authenticated' 
  })
  @ApiResponse({ 
    status: HttpStatus.FORBIDDEN, 
    description: 'Not authorized (subscription required)' 
  })
  @ApiParam({ 
    name: 'id', 
    description: 'The ID of the database to retrieve',
    example: 'db_123456789' 
  })
  async getDatabase(@Param('id') id: string): Promise<NotionDatabaseDto> {
    this.logger.log(`Getting database with ID ${id}`);
    
    // Use Notion API directly to get database
    const notionDatabase = await this.notionApiService.getDatabase(id);
    
    return this.mapNotionDatabaseToDto(notionDatabase);
  }

  /**
   * Sync a database with Notion to update its content
   */
  @Post(':id/sync')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Sync a database with Notion',
    description: 'Updates the local copy of the database with the latest data from Notion.' 
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Database sync initiated successfully', 
    type: DatabaseSyncResultDto 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Database not found' 
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED, 
    description: 'Not authenticated' 
  })
  @ApiResponse({ 
    status: HttpStatus.FORBIDDEN, 
    description: 'Not authorized (subscription required)' 
  })
  @ApiParam({ 
    name: 'id', 
    description: 'The ID of the database to sync',
    example: 'db_123456789' 
  })
  async syncDatabase(@Param('id') id: string, @Req() request: RequestWithAuth): Promise<DatabaseSyncResultDto> {
    const userId = request.auth.userId;
    this.logger.log(`Syncing database with ID ${id} for user ${userId}`);
    
    // Use existing database service for syncing
    const result = await this.databaseService.syncDatabase(id);
    
    // Get updated list of databases using our dedicated method
    const notionDatabases = await this.notionApiService.getAllDatabases();
    
    // Map database objects to DTOs
    const databases = notionDatabases.map(db => this.mapNotionDatabaseToDto(db));
    
    // Publish event to update cache asynchronously
    const cacheKey = this.databaseCacheService.getUserDatabasesCacheKey(userId);
    Promise.resolve(this.eventBus.publish(new DatabasesFetchedEvent(userId, databases, cacheKey)))
      .catch(error => this.logger.error(`Error publishing cache event: ${error.message}`));
    
    return result;
  }
  
  /**
   * Maps cached database DTOs to full database DTOs
   */
  private mapCachedToFullDtos(cachedData: CachedDatabasesListDto): NotionDatabaseDto[] {
    return cachedData.databases.map(db => ({
      id: db.id,
      title: db.title,
      url: db.url,
      workspaceId: '', // Not stored in cache
      ownerId: '',     // Not stored in cache
      lastSyncedAt: new Date(0), // Use epoch date instead of null
      createdAt: db.cachedAt,
      updatedAt: db.cachedAt,
      pageCount: 0
    }));
  }

  /**
   * Maps a Notion API database object to DTO
   */
  private mapNotionDatabaseToDto(notionDatabase: any): NotionDatabaseDto {
    // Extract title from Notion database
    let title = '';
    if (notionDatabase.title && Array.isArray(notionDatabase.title)) {
      title = notionDatabase.title.map((t: any) => t.plain_text).join('');
    }
    
    // Extract description
    let description = '';
    if (notionDatabase.description) {
      description = typeof notionDatabase.description === 'string' 
        ? notionDatabase.description 
        : notionDatabase.description.map((d: any) => d.plain_text).join('');
    }
    
    return {
      id: notionDatabase.id,
      title: title,
      workspaceId: notionDatabase.parent?.workspace_id || '',
      ownerId: '',
      lastSyncedAt: new Date(),
      description: description,
      url: notionDatabase.url,
      createdAt: new Date(notionDatabase.created_time),
      updatedAt: new Date(notionDatabase.last_edited_time),
      pageCount: 0
    };
  }
} 