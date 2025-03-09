import { Injectable, Inject, Logger } from '@nestjs/common';
import { INotionPageRepository } from '../../domain/repositories/notion-page.repository.interface';
import { NotionPage } from '../../domain/models/notion-page.entity';
import { Backlink } from '../../domain/models/backlink.value-object';
import { v4 as uuidv4 } from 'uuid';

interface ExtractedBacklink {
  sourcePageId: string;
  sourcePageTitle: string;
  targetPageId: string;
  context?: string;
}

@Injectable()
export class BacklinkExtractorService {
  private readonly logger = new Logger(BacklinkExtractorService.name);
  
  constructor(
    @Inject('INotionPageRepository')
    private readonly pageRepository: INotionPageRepository,
  ) {}

  /**
   * Extract and save backlinks for all pages
   * This process analyzes the content of all pages and identifies links between them
   */
  async extractBacklinksForAllPages(): Promise<void> {
    const allPages = await this.pageRepository.findAll();
    this.logger.log(`Extracting backlinks for ${allPages.length} pages`);
    
    // Create a map for quick page lookups
    const pageMap = new Map<string, NotionPage>();
    allPages.forEach(page => pageMap.set(page.id, page));
    
    // Process each page to extract its outgoing links
    const backlinksByTargetId = new Map<string, ExtractedBacklink[]>();
    
    for (const sourcePage of allPages) {
      const sourcePageId = sourcePage.id;
      const sourcePageTitle = sourcePage.title;
      const extractedLinks = this.extractLinksFromContent(sourcePage.content || '', sourcePageId);
      
      // Group backlinks by target page
      for (const link of extractedLinks) {
        const targetId = link.targetPageId;
        
        // Skip if target page doesn't exist in our database
        if (!pageMap.has(targetId)) continue;
        
        // Add to our map
        if (!backlinksByTargetId.has(targetId)) {
          backlinksByTargetId.set(targetId, []);
        }
        
        backlinksByTargetId.get(targetId)!.push({
          sourcePageId,
          sourcePageTitle,
          targetPageId: targetId,
          context: link.context,
        });
      }
    }
    
    // Update each page with its backlinks
    for (const [targetPageId, backlinks] of backlinksByTargetId.entries()) {
      const targetPage = pageMap.get(targetPageId);
      if (!targetPage) continue;
      
      // Create backlink domain entities
      const backlinkEntities = backlinks.map(bl => 
        new Backlink({
          id: uuidv4(),
          sourcePageId: bl.sourcePageId,
          sourcePageTitle: bl.sourcePageTitle,
          targetPageId: bl.targetPageId,
          createdAt: new Date(),
          context: bl.context,
        })
      );
      
      // Update page with new backlinks (we'll replace all existing backlinks)
      await this.updatePageBacklinks(targetPage, backlinkEntities);
    }
    
    this.logger.log('Backlink extraction completed');
  }
  
  /**
   * Extract and update backlinks for a specific page
   */
  async extractBacklinksForPage(pageId: string): Promise<number> {
    const page = await this.pageRepository.findById(pageId);
    if (!page) {
      throw new Error(`Page with ID ${pageId} not found`);
    }
    
    const allPages = await this.pageRepository.findAll();
    const pageMap = new Map<string, NotionPage>();
    allPages.forEach(p => pageMap.set(p.id, p));
    
    const backlinks: ExtractedBacklink[] = [];
    
    // Search for links to this page in all other pages
    for (const sourcePage of allPages) {
      if (sourcePage.id === pageId) continue; // Skip self
      
      const sourcePageId = sourcePage.id;
      const sourcePageTitle = sourcePage.title;
      const extractedLinks = this.extractLinksFromContent(sourcePage.content || '', sourcePageId);
      
      // Find links pointing to our target page
      const linksToTargetPage = extractedLinks.filter(link => link.targetPageId === pageId);
      
      for (const link of linksToTargetPage) {
        backlinks.push({
          sourcePageId,
          sourcePageTitle,
          targetPageId: pageId,
          context: link.context,
        });
      }
    }
    
    // Create backlink domain entities
    const backlinkEntities = backlinks.map(bl => 
      new Backlink({
        id: uuidv4(),
        sourcePageId: bl.sourcePageId,
        sourcePageTitle: bl.sourcePageTitle,
        targetPageId: bl.targetPageId,
        createdAt: new Date(),
        context: bl.context,
      })
    );
    
    // Update page with new backlinks
    await this.updatePageBacklinks(page, backlinkEntities);
    
    return backlinkEntities.length;
  }
  
  /**
   * Extract links from page content
   */
  private extractLinksFromContent(content: string, sourcePageId: string): ExtractedBacklink[] {
    if (!content) return [];
    
    const backlinks: ExtractedBacklink[] = [];
    
    // Pattern to match Notion page links: [[pageId]] or [text](pageId)
    const notionLinkPattern = /\[\[(.*?)\]\]|\[([^\]]+)\]\((.*?)\)/g;
    let match;
    
    while ((match = notionLinkPattern.exec(content)) !== null) {
      let targetPageId: string | null = null;
      let context: string | null = null;
      
      if (match[1]) {
        // Format: [[pageId]]
        targetPageId = match[1].trim();
        context = this.extractContext(content, match.index, match[0].length);
      } else if (match[2] && match[3]) {
        // Format: [text](pageId)
        targetPageId = match[3].trim();
        context = match[2]; // Use the link text as context
      }
      
      if (targetPageId && targetPageId !== sourcePageId) {
        backlinks.push({
          sourcePageId,
          sourcePageTitle: '', // This will be filled in by the caller
          targetPageId,
          context: context || undefined,
        });
      }
    }
    
    return backlinks;
  }
  
  /**
   * Extract context around a link
   */
  private extractContext(content: string, linkIndex: number, linkLength: number): string {
    // Extract up to 50 characters before and after the link
    const contextBefore = content.substring(Math.max(0, linkIndex - 50), linkIndex);
    const contextAfter = content.substring(linkIndex + linkLength, Math.min(content.length, linkIndex + linkLength + 50));
    
    return `...${contextBefore}${contextAfter}...`.trim();
  }
  
  /**
   * Update a page's backlinks
   */
  private async updatePageBacklinks(page: NotionPage, newBacklinks: Backlink[]): Promise<void> {
    // Create a copy of the page with updated backlinks
    const updatedPage = new NotionPage({
      id: page.id,
      title: page.title,
      databaseId: page.databaseId,
      url: page.url,
      content: page.content,
      properties: page.properties,
      backlinks: newBacklinks,
      createdAt: page.createdAt,
      updatedAt: new Date(),
    });
    
    // Save the updated page
    await this.pageRepository.save(updatedPage);
  }
} 