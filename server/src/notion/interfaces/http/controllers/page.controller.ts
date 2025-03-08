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
import { PageService } from '../../../application/services/page.service';
import { BacklinkExtractorService } from '../../../application/services/backlink-extractor.service';
import { NotionPageDto, PageSyncResultDto } from '../../../application/dtos/page.dto';
import { AuthGuard } from '../../../../iam/interfaces/http/guards/auth.guard';
import { SubscriptionGuard } from '../../../../iam/interfaces/http/guards/subscription.guard';

@ApiTags('notion-pages')
@Controller('notion/pages')
@UseGuards(AuthGuard, SubscriptionGuard)
export class PageController {
  private readonly logger = new Logger(PageController.name);

  constructor(
    private readonly pageService: PageService,
    private readonly backlinkExtractorService: BacklinkExtractorService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get pages filtered by database ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of pages returned successfully',
    type: [NotionPageDto]
  })
  @ApiQuery({ 
    name: 'database', 
    required: false, 
    description: 'Filter pages by database ID' 
  })
  async getPages(@Query('database') databaseId?: string): Promise<NotionPageDto[]> {
    this.logger.log('Getting pages');
    
    if (databaseId) {
      this.logger.log(`Filtering by database ID: ${databaseId}`);
      return this.pageService.getPagesByDatabaseId(databaseId);
    }
    
    return this.pageService.getAllPages();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific page by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Page returned successfully',
    type: NotionPageDto
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Page not found'
  })
  @ApiParam({ name: 'id', description: 'The ID of the page to retrieve' })
  async getPage(@Param('id') id: string): Promise<NotionPageDto> {
    this.logger.log(`Getting page with ID ${id}`);
    return this.pageService.getPageById(id);
  }

  @Get(':id/with-backlinks')
  @ApiOperation({ summary: 'Get a page with its backlinks' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Page with backlinks returned successfully',
    type: NotionPageDto
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Page not found'
  })
  @ApiParam({ name: 'id', description: 'The ID of the page to retrieve with backlinks' })
  async getPageWithBacklinks(@Param('id') id: string): Promise<NotionPageDto> {
    this.logger.log(`Getting page with backlinks for ID ${id}`);
    return this.pageService.getPageWithBacklinks(id);
  }

  @Get(':id/outgoing-backlinks')
  @ApiOperation({ summary: 'Get pages that are linked from this page' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Outgoing backlinks returned successfully',
    type: [NotionPageDto]
  })
  @ApiParam({ name: 'id', description: 'The ID of the source page' })
  async getOutgoingBacklinks(@Param('id') id: string): Promise<NotionPageDto[]> {
    this.logger.log(`Getting outgoing backlinks for page ID ${id}`);
    return this.pageService.getOutgoingBacklinks(id);
  }

  @Post(':id/sync')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sync a page with Notion' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Page sync completed successfully',
    type: PageSyncResultDto
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Page not found'
  })
  @ApiParam({ name: 'id', description: 'The ID of the page to sync' })
  async syncPage(@Param('id') id: string): Promise<PageSyncResultDto> {
    this.logger.log(`Syncing page with ID ${id}`);
    return this.pageService.syncPage(id);
  }

  @Post(':id/extract-backlinks')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Extract backlinks for a specific page' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Backlinks extracted successfully',
    schema: {
      properties: {
        pageId: { type: 'string' },
        backlinkCount: { type: 'number' }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Page not found'
  })
  @ApiParam({ name: 'id', description: 'The ID of the page to extract backlinks for' })
  async extractBacklinks(@Param('id') id: string): Promise<{ pageId: string; backlinkCount: number }> {
    this.logger.log(`Extracting backlinks for page ID ${id}`);
    const backlinkCount = await this.backlinkExtractorService.extractBacklinksForPage(id);
    return { pageId: id, backlinkCount };
  }
} 