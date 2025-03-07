// src/notion/domain/models/__tests__/notion-page.entity.spec.ts
import { NotionPage } from '../notion-page.entity';
import { PageProperty } from '../page-property.value-object';
import { Backlink } from '../backlink.value-object';
import { PageUpdatedEvent } from '../../events/page-updated.event';

describe('NotionPage', () => {
  let page: NotionPage;
  
  beforeEach(() => {
    page = new NotionPage({
      id: 'page123',
      title: 'Test Page',
      databaseId: 'db123',
      url: 'https://notion.so/page123',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });

  it('should be defined', () => {
    expect(page).toBeDefined();
  });

  it('should have correct properties', () => {
    expect(page.id).toBe('page123');
    expect(page.title).toBe('Test Page');
    expect(page.databaseId).toBe('db123');
    expect(page.url).toBe('https://notion.so/page123');
    expect(page.createdAt).toBeInstanceOf(Date);
    expect(page.updatedAt).toBeInstanceOf(Date);
  });

  it('should add properties to page', () => {
    const property = new PageProperty({
      id: 'prop123',
      name: 'Status',
      type: 'select',
      value: 'In Progress',
    });
    
    page.addProperty(property);
    
    expect(page.properties).toContainEqual(property);
    expect(page.getPropertyByName('Status')).toEqual(property);
  });

  it('should add backlinks to page', () => {
    const backlink = new Backlink({
      id: 'link123',
      sourcePageId: 'source123',
      sourcePageTitle: 'Source Page',
      targetPageId: 'page123',
      createdAt: new Date(),
    });
    
    page.addBacklink(backlink);
    
    expect(page.backlinks).toContainEqual(backlink);
  });

  it('should update page content and raise event', () => {
    const newTitle = 'Updated Title';
    const newContent = 'Updated content for this page';
    const updateTime = new Date();
    
    page.update({ title: newTitle, content: newContent, updatedAt: updateTime });
    
    expect(page.title).toBe(newTitle);
    expect(page.content).toBe(newContent);
    expect(page.updatedAt).toEqual(updateTime);
    
    // Should raise a PageUpdatedEvent
    expect(page.domainEvents).toHaveLength(1);
    expect(page.domainEvents[0]).toBeInstanceOf(PageUpdatedEvent);
    expect((page.domainEvents[0] as PageUpdatedEvent).pageId).toBe('page123');
  });
});