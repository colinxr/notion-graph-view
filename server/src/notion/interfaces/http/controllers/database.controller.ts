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
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { DatabaseService } from '../../../application/services/database.service';
import { NotionDatabaseDto, DatabaseSyncResultDto } from '../../../application/dtos/database.dto';
import { AuthGuard } from '../../../../iam/interfaces/http/guards/auth.guard';
import { SubscriptionGuard } from '../../../../iam/interfaces/http/guards/subscription.guard';
import { User } from '../../../../iam/interfaces/http/decorators/user.decorator';
import { UserDto } from '../../../../iam/application/dtos/user.dto';

@ApiTags('notion-databases')
@Controller('notion/databases')
@UseGuards(AuthGuard, SubscriptionGuard)
export class DatabaseController {
  private readonly logger = new Logger(DatabaseController.name);

  constructor(private readonly databaseService: DatabaseService) {}

  @Get()
  @ApiOperation({ summary: 'Get all databases for the authenticated user' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'List of databases returned successfully', 
    type: [NotionDatabaseDto] 
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

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific database by ID' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Database returned successfully', 
    type: NotionDatabaseDto 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Database not found' 
  })
  @ApiParam({ name: 'id', description: 'The ID of the database to retrieve' })
  async getDatabase(@Param('id') id: string): Promise<NotionDatabaseDto> {
    this.logger.log(`Getting database with ID ${id}`);
    return this.databaseService.getDatabaseById(id);
  }

  @Post(':id/sync')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sync a database with Notion' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Database sync initiated successfully', 
    type: DatabaseSyncResultDto 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Database not found' 
  })
  @ApiParam({ name: 'id', description: 'The ID of the database to sync' })
  async syncDatabase(@Param('id') id: string): Promise<DatabaseSyncResultDto> {
    this.logger.log(`Syncing database with ID ${id}`);
    return this.databaseService.syncDatabase(id);
  }
} 