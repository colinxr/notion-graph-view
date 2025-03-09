import { 
  Controller, 
  Get, 
  Param, 
  Post,
  UseGuards,
  Query,
  HttpStatus,
  HttpCode,
  Logger
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam, 
  ApiQuery, 
  ApiBearerAuth, 
  ApiHeader
} from '@nestjs/swagger';
import { DatabaseService } from '../../../application/services/database.service';
import { NotionDatabaseDto, DatabaseSyncResultDto } from '../../../application/dtos/database.dto';
import { AuthGuard } from '../../../../iam/interfaces/http/guards/auth.guard';
import { SubscriptionGuard } from '../../../../iam/interfaces/http/guards/subscription.guard';
import { User } from '../../../../iam/interfaces/http/decorators/user.decorator';
import { UserDto } from '../../../../iam/application/dtos/user.dto';

/**
 * Controller for handling Notion database operations
 * 
 * Provides endpoints for:
 * - Listing all databases or filtered by workspace
 * - Retrieving a specific database by ID
 * - Syncing a database with Notion to update its content
 */
@ApiTags('notion-databases')
@ApiBearerAuth('JWT-auth')
@Controller('notion/databases')
@UseGuards(AuthGuard, SubscriptionGuard)
export class NotionDatabaseController {
  private readonly logger = new Logger(NotionDatabaseController.name);

  constructor(private readonly databaseService: DatabaseService) {}

  /**
   * Retrieve all databases or filter by workspace
   */
  @Get()
  @ApiOperation({ 
    summary: 'Get all databases for the authenticated user',
    description: 'Returns a list of Notion databases the user has access to. Can be filtered by workspace ID.' 
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
  @ApiQuery({ 
    name: 'workspace', 
    required: false, 
    description: 'Filter databases by workspace ID' 
  })
  async getDatabases(
    @User() user: UserDto,
    @Query('workspace') workspaceId?: string,
  ): Promise<NotionDatabaseDto[]> {
    this.logger.log(`Getting databases for user ${user.id}`);
    
    if (workspaceId) {
      return this.databaseService.getDatabasesByWorkspace(workspaceId);
    }
    
    return this.databaseService.getAllDatabases();
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
    return this.databaseService.getDatabaseById(id);
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
  async syncDatabase(@Param('id') id: string): Promise<DatabaseSyncResultDto> {
    this.logger.log(`Syncing database with ID ${id}`);
    return this.databaseService.syncDatabase(id);
  }
} 