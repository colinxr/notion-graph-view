import { Injectable, Inject, Logger, NotFoundException } from '@nestjs/common';
import { INotionPageRepository } from '../../domain/repositories/notion-page.repository.interface';
import { INotionDatabaseRepository } from '../../domain/repositories/notion-database.repository.interface';
import { NotionApiService } from '../../infrastructure/api/notion-api.service';
import { NotionPage } from '../../domain/models/notion-page.entity';
import { PageProperty } from '../../domain/models/page-property.value-object';
import { 
  NotionPageDto, 
  PageSyncResultDto,
  PagePropertyDto
} from '../dtos/page.dto';
import { BacklinkDto } from '../dtos/backlink.dto';

@Injectable()
export class PageService {
  private readonly logger = new Logger(PageService.name);

  constructor(
    @Inject('INotionPageRepository')
    private readonly pageRepository: INotionPageRepository,
    @Inject('INotionDatabaseRepository')
    private readonly databaseRepository: INotionDatabaseRepository,
    private readonly notionApiService: NotionApiService,
  ) {}

  /**
   * Get all pages
   */
  async getAllPages(): Promise<NotionPageDto[]> {
    const pages = await this.pageRepository.findAll();
    return pages.map(page => this.toDto(page));
  }

  /**
   * Get pages by database ID
   */
  async getPagesByDatabaseId(databaseId: string): Promise<NotionPageDto[]> {
    const pages = await this.pageRepository.findByDatabaseId(databaseId);
    return pages.map(page => this.toDto(page));
  }

  /**
   * Get a page by ID
   */
  async getPageById(id: string): Promise<NotionPageDto> {
    const page = await this.pageRepository.findById(id);
    if (!page) {
      throw new NotFoundException(`Page with ID ${id} not found`);
    }
    return this.toDto(page);
  }

  /**
   * Get a page with backlinks
   */
  async getPageWithBacklinks(id: string): Promise<NotionPageDto> {
    const page = await this.pageRepository.findWithBacklinks(id);
    if (!page) {
      throw new NotFoundException(`Page with ID ${id} not found`);
    }
    return this.toDto(page);
  }

  /**
   * Get outgoing backlinks from a page
   */
  async getOutgoingBacklinks(id: string): Promise<NotionPageDto[]> {
    const pages = await this.pageRepository.findOutgoingBacklinks(id);
    return pages.map(page => this.toDto(page));
  }

  /**
   * Sync a page from Notion API
   */
  async syncPage(id: string): Promise<PageSyncResultDto> {
    // Get page from repository
    const page = await this.pageRepository.findById(id);
    if (!page) {
      throw new NotFoundException(`Page with ID ${id} not found`);
    }

    // Fetch page from Notion API
    const notionPage = await this.notionApiService.getPage(id);
    
    // Initialize variables for updates
    let contentUpdated = false;
    let propertiesUpdated = false;
    let pageTitle = page.title;
    let pageContent = page.content;
    let pageProperties = page.properties;

    // Extract page title
    if (notionPage.properties && notionPage.properties.Name && 
        notionPage.properties.Name.type === 'title') {
      const titleProp = notionPage.properties.Name;
      if (titleProp.title && Array.isArray(titleProp.title)) {
        const newTitle = titleProp.title.map((t: any) => t.plain_text || '').join('');
        if (newTitle && page.title !== newTitle) {
          pageTitle = newTitle;
          propertiesUpdated = true;
        }
      }
    }

    // Fetch page content blocks
    const blocks = await this.notionApiService.getPageBlocks(id);
    
    // Extract plain text from blocks
    const newContent = this.extractPlainTextFromBlocks(blocks);
    if (page.content !== newContent) {
      pageContent = newContent;
      contentUpdated = true;
    }

    // Process properties
    if (notionPage.properties) {
      const updatedProperties = this.extractPropertiesFromNotion(notionPage.properties);
      
      // Check if properties have changed
      const existingPropMap = new Map(page.properties.map(p => [p.id, p]));
      let hasPropertyChanges = updatedProperties.length !== page.properties.length;
      
      if (!hasPropertyChanges) {
        for (const prop of updatedProperties) {
          const existingProp = existingPropMap.get(prop.id);
          if (!existingProp || !this.arePropertiesEqual(existingProp, prop)) {
            hasPropertyChanges = true;
            break;
          }
        }
      }

      if (hasPropertyChanges) {
        pageProperties = updatedProperties;
        propertiesUpdated = true;
      }
    }

    // Save updated page if there are changes
    if (contentUpdated || propertiesUpdated) {
      const updatedPage = new NotionPage({
        id: page.id,
        title: pageTitle,
        databaseId: page.databaseId,
        url: page.url,
        content: pageContent,
        properties: pageProperties,
        backlinks: page.backlinks,
        createdAt: page.createdAt,
        updatedAt: new Date(),
      });
      
      await this.pageRepository.save(updatedPage);
    }

    return {
      pageId: id,
      databaseId: page.databaseId,
      backlinkCount: page.backlinks.length,
      contentUpdated,
      propertiesUpdated,
      syncedAt: new Date(),
    };
  }

  /**
   * Convert domain entity to DTO
   */
  private toDto(page: NotionPage): NotionPageDto {
    return {
      id: page.id,
      title: page.title,
      databaseId: page.databaseId,
      url: page.url,
      content: page.content,
      properties: page.properties.map(prop => ({
        id: prop.id,
        name: prop.name,
        type: prop.type,
        value: prop.value,
      })),
      backlinks: page.backlinks.map(link => ({
        id: link.id,
        sourcePageId: link.sourcePageId,
        sourcePageTitle: link.sourcePageTitle,
        targetPageId: link.targetPageId,
        createdAt: link.createdAt,
        context: link.context,
      })),
      createdAt: page.createdAt,
      updatedAt: page.updatedAt,
    };
  }

  /**
   * Extract plain text from Notion blocks
   */
  private extractPlainTextFromBlocks(blocks: any[]): string {
    const textParts: string[] = [];

    for (const block of blocks) {
      if (block.type === 'paragraph' && block.paragraph) {
        const paragraphText = block.paragraph.rich_text
          ?.map((text: any) => text.plain_text || '')
          .join('') || '';
        
        if (paragraphText) {
          textParts.push(paragraphText);
        }
      } else if (block.type === 'heading_1' && block.heading_1) {
        const headingText = block.heading_1.rich_text
          ?.map((text: any) => text.plain_text || '')
          .join('') || '';
        
        if (headingText) {
          textParts.push(`# ${headingText}`);
        }
      } else if (block.type === 'heading_2' && block.heading_2) {
        const headingText = block.heading_2.rich_text
          ?.map((text: any) => text.plain_text || '')
          .join('') || '';
        
        if (headingText) {
          textParts.push(`## ${headingText}`);
        }
      } else if (block.type === 'heading_3' && block.heading_3) {
        const headingText = block.heading_3.rich_text
          ?.map((text: any) => text.plain_text || '')
          .join('') || '';
        
        if (headingText) {
          textParts.push(`### ${headingText}`);
        }
      } else if (block.type === 'bulleted_list_item' && block.bulleted_list_item) {
        const itemText = block.bulleted_list_item.rich_text
          ?.map((text: any) => text.plain_text || '')
          .join('') || '';
        
        if (itemText) {
          textParts.push(`- ${itemText}`);
        }
      }
      // Add more block types as needed
    }

    return textParts.join('\n\n');
  }

  /**
   * Extract properties from Notion response
   */
  private extractPropertiesFromNotion(properties: any): PageProperty[] {
    const result: PageProperty[] = [];

    for (const [name, property] of Object.entries<any>(properties)) {
      const type = property.type as string;
      let value: any = null;

      switch (type) {
        case 'title':
          value = property.title?.map((t: any) => t.plain_text).join('') || '';
          break;
        case 'rich_text':
          value = property.rich_text?.map((t: any) => t.plain_text).join('') || '';
          break;
        case 'number':
          value = property.number;
          break;
        case 'select':
          value = property.select?.name || null;
          break;
        case 'multi_select':
          value = property.multi_select?.map((s: any) => s.name) || [];
          break;
        case 'date':
          value = property.date?.start ? new Date(property.date.start) : null;
          break;
        case 'checkbox':
          value = property.checkbox || false;
          break;
        case 'url':
          value = property.url || '';
          break;
        case 'email':
          value = property.email || '';
          break;
        default:
          // Handle other property types or leave as null
          break;
      }

      result.push(new PageProperty({
        id: property.id,
        name,
        type: type as any,
        value,
      }));
    }

    return result;
  }

  /**
   * Compare two page properties for equality
   */
  private arePropertiesEqual(a: PageProperty, b: PageProperty): boolean {
    // Basic equality check
    if (a.id !== b.id || a.name !== b.name || a.type !== b.type) {
      return false;
    }

    // Value equality check based on type
    if (a.type === 'date' && a.value instanceof Date && b.value instanceof Date) {
      return a.value.getTime() === b.value.getTime();
    } else if (Array.isArray(a.value) && Array.isArray(b.value)) {
      if (a.value.length !== b.value.length) return false;
      
      // Compare array elements
      for (let i = 0; i < a.value.length; i++) {
        if (a.value[i] !== b.value[i]) return false;
      }
      return true;
    } else {
      return a.value === b.value;
    }
  }
} 