import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

/**
 * Service for interacting with the Notion API
 */
@Injectable()
export class NotionApiService {
  private readonly logger = new Logger(NotionApiService.name);
  private readonly baseUrl = 'https://api.notion.com/v1';
  private readonly apiKey: string;
  private readonly headers: Record<string, string>;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiKey = this.configService.get<string>('NOTION_API_KEY', '');
    this.headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    };
  }

  /**
   * List databases accessible to the integration
   */
  async listDatabases() {
    try {
      this.logger.log('Listing databases from Notion API');
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/databases`, { headers: this.headers })
      );
      return response.data.results;
    } catch (error) {
      this.logger.error(`Error listing databases: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Retrieve a database by ID
   * @param databaseId Notion database ID
   */
  async getDatabase(databaseId: string) {
    try {
      this.logger.log(`Getting database with ID ${databaseId}`);
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/databases/${databaseId}`, { headers: this.headers })
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Error getting database ${databaseId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Query a database for its pages
   * @param databaseId Notion database ID
   */
  async queryDatabase(databaseId: string, filter?: any) {
    try {
      this.logger.log(`Querying database with ID ${databaseId}`);
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.baseUrl}/databases/${databaseId}/query`, 
          { filter },
          { headers: this.headers }
        )
      );
      return response.data.results;
    } catch (error) {
      this.logger.error(`Error querying database ${databaseId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Retrieve a page by ID
   * @param pageId Notion page ID
   */
  async getPage(pageId: string) {
    try {
      this.logger.log(`Getting page with ID ${pageId}`);
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/pages/${pageId}`, { headers: this.headers })
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Error getting page ${pageId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Retrieve a page's content (blocks)
   * @param pageId Notion page ID
   */
  async getPageContent(pageId: string) {
    try {
      this.logger.log(`Getting content for page with ID ${pageId}`);
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/blocks/${pageId}/children`, { headers: this.headers })
      );
      return response.data.results;
    } catch (error) {
      this.logger.error(`Error getting page content ${pageId}: ${error.message}`, error.stack);
      throw error;
    }
  }
} 