// src/notion/domain/models/__tests__/notion-database.entity.spec.ts
import { NotionDatabase } from '../notion-database.entity';
import { DatabaseImportedEvent } from '../../events/database-imported.event';
import { IEntity } from '../../../../shared/kernel/interfaces/entity.interface';
import { IAggregateRoot } from '../../../../shared/kernel/interfaces/aggregate-root.interface';

describe('NotionDatabase', () => {
  let database: NotionDatabase;

  beforeEach(() => {
    database = new NotionDatabase({
      id: 'db123',
      title: 'Test Database',
      workspaceId: 'ws123',
      ownerId: 'user123',
      lastSyncedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });

  it('should be defined', () => {
    expect(database).toBeDefined();
  });

  it('should implement Entity and AggregateRoot interfaces', () => {
    expect(database).toBeInstanceOf(Object);
    // Check for entity and aggregate root interface implementation
    expect(typeof database.id).toBe('string');
    expect(Array.isArray(database.domainEvents)).toBeTruthy();
  });

  it('should have correct properties', () => {
    expect(database.id).toBe('db123');
    expect(database.title).toBe('Test Database');
    expect(database.workspaceId).toBe('ws123');
    expect(database.ownerId).toBe('user123');
    expect(database.lastSyncedAt).toBeInstanceOf(Date);
  });

  it('should add pages to database', () => {
    const mockPage = { id: 'page123', databaseId: 'db123' };
    database.addPage(mockPage as any);
    
    expect(database.pages).toContainEqual(mockPage);
  });

  it('should get pages from database', () => {
    const mockPage1 = { id: 'page123', databaseId: 'db123' };
    const mockPage2 = { id: 'page456', databaseId: 'db123' };
    
    database.addPage(mockPage1 as any);
    database.addPage(mockPage2 as any);
    
    expect(database.getPages()).toHaveLength(2);
    expect(database.getPages()).toContainEqual(mockPage1);
    expect(database.getPages()).toContainEqual(mockPage2);
  });

  it('should update lastSyncedAt and raise event when marked as synced', () => {
    const newDate = new Date();
    database.markAsSynced(newDate);
    
    expect(database.lastSyncedAt).toEqual(newDate);
    
    // Should raise a DatabaseImportedEvent
    expect(database.domainEvents).toHaveLength(1);
    expect(database.domainEvents[0]).toBeInstanceOf(DatabaseImportedEvent);
    expect((database.domainEvents[0] as DatabaseImportedEvent).databaseId).toBe('db123');
  });
});