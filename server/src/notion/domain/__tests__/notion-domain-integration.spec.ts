// src/notion/domain/__tests__/notion-domain-integration.spec.ts
import { NotionDatabase } from '../models/notion-database.entity';
import { NotionPage } from '../models/notion-page.entity';
import { PageProperty } from '../models/page-property.value-object';
import { Backlink } from '../models/backlink.value-object';
import { DatabaseImportedEvent } from '../events/database-imported.event';
import { PageUpdatedEvent } from '../events/page-updated.event';

describe('Notion Domain Model Integration', () => {
  it('should demonstrate the complete domain model working together', () => {
    // Create a database
    const database = new NotionDatabase({
      id: 'db123',
      title: 'Project Notes',
      workspaceId: 'ws123',
      ownerId: 'user123',
      lastSyncedAt: new Date('2023-01-01'),
    });
    
    // Create pages
    const page1 = new NotionPage({
      id: 'page1',
      title: 'Introduction',
      databaseId: 'db123',
      url: 'https://notion.so/page1',
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01'),
      content: 'This is an introduction to our project.',
    });
    
    const page2 = new NotionPage({
      id: 'page2',
      title: 'Features',
      databaseId: 'db123',
      url: 'https://notion.so/page2',
      createdAt: new Date('2023-01-02'),
      updatedAt: new Date('2023-01-02'),
      content: 'This page describes the features, referencing the [[Introduction]].',
    });
    
    // Add properties to pages
    page1.addProperty(new PageProperty({
      id: 'prop1',
      name: 'Status',
      type: 'select',
      value: 'Complete',
    }));
    
    page2.addProperty(new PageProperty({
      id: 'prop2',
      name: 'Status',
      type: 'select',
      value: 'In Progress',
    }));
    
    // Create backlinks
    const backlink = new Backlink({
      id: 'link1',
      sourcePageId: 'page2',
      sourcePageTitle: 'Features',
      targetPageId: 'page1',
      createdAt: new Date('2023-01-02'),
      context: 'referencing the [[Introduction]]',
    });
    
    // Add backlink to page
    page1.addBacklink(backlink);
    
    // Add pages to database
    database.addPage(page1);
    database.addPage(page2);
    
    // Update a page (which raises an event)
    page2.update({
      title: 'Key Features',
      content: 'Updated content with reference to [[Introduction]].',
      updatedAt: new Date('2023-01-03'),
    });
    
    // Mark database as synced (which raises an event)
    const syncDate = new Date('2023-01-04');
    database.markAsSynced(syncDate);
    
    // Verify structure
    expect(database.getPages()).to