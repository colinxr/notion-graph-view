import { Injectable, Inject, Logger, NotFoundException } from '@nestjs/common';
import { INotionDatabaseRepository } from '../../domain/repositories/notion-database.repository.interface';
import { INotionPageRepository } from '../../domain/repositories/notion-page.repository.interface';
import { NotionApiService } from '../../infrastructure/api/notion-api.service';
import { NotionDatabase } from '../../domain/models/notion-database.entity';
import { NotionPage } from '../../domain/models/notion-page.entity';
import { 
  NotionDatabaseDto, 
  DatabaseSyncResultDto 
} from '../dtos/database.dto';

@Injectable()
export class DatabaseService {
  private readonly logger = new Logger(DatabaseService.name);

  constructor(
    @Inject('INotionDatabaseRepository')
    private readonly databaseRepository: INotionDatabaseRepository,
    @Inject('INotionPageRepository')
    private readonly pageRepository: INotionPageRepository,
    private readonly notionApiService: NotionApiService,
  ) {}

  /**
   * Get all databases
   */
  async getAllDatabases(): Promise<NotionDatabaseDto[]> {
    const databases = await this.databaseRepository.findAll();
    return databases.map(db => this.toDto(db));
  }

  /**
   * Get databases by workspace
   */
  async getDatabasesByWorkspace(workspaceId: string): Promise<NotionDatabaseDto[]> {
    const databases = await this.databaseRepository.findByWorkspaceId(workspaceId);
    return databases.map(db => this.toDto(db));
  }

  /**
   * Get database by ID
   */
  async getDatabaseById(id: string): Promise<NotionDatabaseDto> {
    const database = await this.databaseRepository.findById(id);
    if (!database) {
      throw new NotFoundException(`Database with ID ${id} not found`);
    }
    return this.toDto(database);
  }

  /**
   * Update database's lastSyncedAt
   */
  private async updateDatabaseLastSyncedAt(database: NotionDatabase, syncTime: Date): Promise<void> {
    const updatedDatabase = new NotionDatabase({
      id: database.id,
      title: database.title,
      workspaceId: database.workspaceId,
      ownerId: database.ownerId,
      lastSyncedAt: syncTime,
      description: database.description,
      url: database.url,
      createdAt: database.createdAt,
      updatedAt: syncTime,
    });
    
    await this.databaseRepository.save(updatedDatabase);
  }

  /**
   * Sync database from Notion API
   */
  async syncDatabase(id: string): Promise<DatabaseSyncResultDto> {
    // Get database from repository
    const database = await this.databaseRepository.findById(id);
    if (!database) {
      throw new NotFoundException(`Database with ID ${id} not found`);
    }

    // Fetch database from Notion API
    const notionDatabase = await this.notionApiService.getDatabase(id);
    
    // Update database information if needed
    let isUpdated = false;
    let title = database.title;
    let description = database.description;
    let url = database.url;
    
    // Extract title from Notion database
    if (notionDatabase.title && Array.isArray(notionDatabase.title)) {
      const newTitle = notionDatabase.title.map(t => t.plain_text).join('');
      if (newTitle && database.title !== newTitle) {
        title = newTitle;
        isUpdated = true;
      }
    }

    // Extract description from Notion database
    if (notionDatabase.description) {
      const newDescription = typeof notionDatabase.description === 'string' 
        ? notionDatabase.description 
        : notionDatabase.description.map(d => d.plain_text).join('');
      
      if (newDescription && database.description !== newDescription) {
        description = newDescription;
        isUpdated = true;
      }
    }

    // Extract URL from Notion database
    if (notionDatabase.url && database.url !== notionDatabase.url) {
      url = notionDatabase.url;
      isUpdated = true;
    }
    
    // Create a new database entity with updated values
    if (isUpdated) {
      const updatedDatabase = new NotionDatabase({
        id: database.id,
        title: title,
        workspaceId: database.workspaceId,
        ownerId: database.ownerId,
        lastSyncedAt: database.lastSyncedAt,
        description: description,
        url: url,
        createdAt: database.createdAt,
        updatedAt: new Date(),
      });
      
      await this.databaseRepository.save(updatedDatabase);
    }
    
    // Query all pages from the database
    const notionPages = await this.notionApiService.queryDatabase(id);
    this.logger.log(`Retrieved ${notionPages.length} pages from Notion API for database ${id}`);

    // Process all pages
    let newPages = 0;
    let updatedPages = 0;
    
    for (const notionPage of notionPages) {
      const pageId = notionPage.id;
      const existingPage = await this.pageRepository.findById(pageId);
      
      // Extract page title
      let pageTitle = '';
      if (notionPage.properties && notionPage.properties.Name && 
          notionPage.properties.Name.type === 'title') {
        const titleProp = notionPage.properties.Name;
        if (titleProp.title && Array.isArray(titleProp.title)) {
          pageTitle = titleProp.title.map((t: any) => t.plain_text || '').join('');
        }
      }

      if (existingPage) {
        // Update existing page if title changed
        if (existingPage.title !== pageTitle) {
          const updatedPage = new NotionPage({
            id: existingPage.id,
            title: pageTitle,
            databaseId: existingPage.databaseId,
            url: existingPage.url,
            content: existingPage.content,
            properties: existingPage.properties,
            backlinks: existingPage.backlinks,
            createdAt: existingPage.createdAt,
            updatedAt: new Date(),
          });
          
          await this.pageRepository.save(updatedPage);
          updatedPages++;
        }
      } else {
        // Create new page
        const newPage = new NotionPage({
          id: pageId,
          title: pageTitle,
          databaseId: id,
          url: notionPage.url,
          properties: [],
          backlinks: [],
          createdAt: new Date(notionPage.created_time),
          updatedAt: new Date(notionPage.last_edited_time),
        });
        
        await this.pageRepository.save(newPage);
        newPages++;
      }
    }

    // Update database's lastSyncedAt
    const now = new Date();
    await this.updateDatabaseLastSyncedAt(database, now);

    return {
      databaseId: id,
      newPages,
      updatedPages,
      totalPages: notionPages.length,
      syncedAt: now,
    };
  }

  /**
   * Convert domain entity to DTO
   */
  private toDto(database: NotionDatabase): NotionDatabaseDto {
    return {
      id: database.id,
      title: database.title,
      workspaceId: database.workspaceId,
      ownerId: database.ownerId,
      lastSyncedAt: database.lastSyncedAt,
      description: database.description,
      url: database.url,
      createdAt: database.createdAt,
      updatedAt: database.updatedAt,
      pageCount: 0, // This would need to be populated by querying the pages
    };
  }
} 