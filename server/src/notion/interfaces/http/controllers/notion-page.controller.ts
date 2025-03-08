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
  ApiExtraModels,
  getSchemaPath
} from '@nestjs/swagger';
import { PageService } from '../../../application/services/page.service';
import { BacklinkExtractorService } from '../../../application/services/backlink-extractor.service';
import { NotionPageDto, PageSyncResultDto, PagePropertyDto } from '../../../application/dtos/page.dto';
import { BacklinkDto } from '../../../application/dtos/backlink.dto';
import { AuthGuard } from '../../../../iam/interfaces/http/guards/auth.guard';
import { SubscriptionGuard } from '../../../../iam/interfaces/http/guards/subscription.guard';

/**
 * Controller for handling Notion page operations
 * 
 * Provides endpoints for:
 * - Listing pages with optional filtering by database
 * - Retrieving specific pages by ID
 * - Working with page backlinks
 * - Syncing pages with Notion
 * - Extracting backlinks from page content
 */
@ApiTags('notion-pages')
@ApiBearerAuth('JWT-auth')
@ApiExtraModels(PagePropertyDto, BacklinkDto)
@Controller('notion/pages')
@UseGuards(AuthGuard, SubscriptionGuard)
export class NotionPageController {
  private readonly logger = new Logger(NotionPageController.name);

  constructor(
    private readonly pageService: PageService,
    private readonly backlinkExtractorService: BacklinkExtractorService,
  ) {}

  /**
   * Retrieve all pages or filter by database ID
   */
  @Get()
  @ApiOperation({ 
    summary: 'Get pages filtered by database ID',
    description: 'Returns a list of Notion pages. Can be filtered by database ID.' 
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of pages returned successfully',
    type: [NotionPageDto]
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
    name: 'database', 
    required: false, 
    description: 'Filter pages by database ID',
    example: 'db_123456789'
  })
  async getPages(@Query('database') databaseId?: string): Promise<NotionPageDto[]> {
    this.logger.log('Getting pages');
    
    if (databaseId) {
      this.logger.log(`Filtering by database ID: ${databaseId}`);
      return this.pageService.getPagesByDatabaseId(databaseId);
    }
    
    return this.pageService.getAllPages();
  }

  /**
   * Retrieve a specific page by its ID
   */
  @Get(':id')
  @ApiOperation({ 
    summary: 'Get a specific page by ID',
    description: 'Returns detailed information about a single Notion page.'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Page returned successfully',
    type: NotionPageDto
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Page not found'
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
    description: 'The ID of the page to retrieve',
    example: 'page_123456789'
  })
  async getPage(@Param('id') id: string): Promise<NotionPageDto> {
    this.logger.log(`Getting page with ID ${id}`);
    return this.pageService.getPageById(id);
  }

  /**
   * Retrieve a page with its backlinks
   */
  @Get(':id/with-backlinks')
  @ApiOperation({ 
    summary: 'Get a page with its backlinks',
    description: 'Returns a page along with all backlinks referencing it from other pages.'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Page with backlinks returned successfully',
    type: NotionPageDto
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Page not found'
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
    description: 'The ID of the page to retrieve with backlinks',
    example: 'page_123456789'
  })
  async getPageWithBacklinks(@Param('id') id: string): Promise<NotionPageDto> {
    this.logger.log(`Getting page with backlinks for ID ${id}`);
    return this.pageService.getPageWithBacklinks(id);
  }

  /**
   * Retrieve pages that are linked from the source page
   */
  @Get(':id/outgoing-backlinks')
  @ApiOperation({ 
    summary: 'Get pages that are linked from this page',
    description: 'Returns a list of pages that the specified page links to.'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Outgoing backlinks returned successfully',
    type: [NotionPageDto]
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
    description: 'The ID of the source page',
    example: 'page_123456789'
  })
  async getOutgoingBacklinks(@Param('id') id: string): Promise<NotionPageDto[]> {
    this.logger.log(`Getting outgoing backlinks for page ID ${id}`);
    return this.pageService.getOutgoingBacklinks(id);
  }

  /**
   * Sync a page with Notion to update its content
   */
  @Post(':id/sync')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Sync a page with Notion',
    description: 'Updates the local copy of the page with the latest data from Notion.'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Page sync completed successfully',
    type: PageSyncResultDto
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Page not found'
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
    description: 'The ID of the page to sync',
    example: 'page_123456789'
  })
  async syncPage(@Param('id') id: string): Promise<PageSyncResultDto> {
    this.logger.log(`Syncing page with ID ${id}`);
    return this.pageService.syncPage(id);
  }

  /**
   * Extract backlinks from a page's content
   */
  @Post(':id/extract-backlinks')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Extract backlinks for a specific page',
    description: 'Extracts backlinks from the page content and returns the count of found links.'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Backlinks extracted successfully',
    schema: {
      properties: {
        pageId: { 
          type: 'string',
          description: 'ID of the page processed',
          example: 'page_123456789'
        },
        backlinkCount: { 
          type: 'number',
          description: 'Number of backlinks found',
          example: 5
        }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Page not found'
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
    description: 'The ID of the page to extract backlinks for',
    example: 'page_123456789'
  })
  async extractBacklinks(@Param('id') id: string): Promise<{ pageId: string; backlinkCount: number }> {
    this.logger.log(`Extracting backlinks for page ID ${id}`);
    const backlinkCount = await this.backlinkExtractorService.extractBacklinksForPage(id);
    return { pageId: id, backlinkCount };
  }
} 