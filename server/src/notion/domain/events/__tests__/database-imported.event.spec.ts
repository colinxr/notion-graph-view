import { DatabaseImportedEvent } from '../database-imported.event';
import { IDomainEvent } from '../../../../shared/kernel/interfaces/domain-event.interface';

describe('DatabaseImportedEvent', () => {
  it('should be defined', () => {
    const event = new DatabaseImportedEvent({
      databaseId: 'db123',
      workspaceId: 'ws123',
      ownerId: 'user123',
      occurredAt: new Date(),
    });
    
    expect(event).toBeDefined();
  });

  it('should implement IDomainEvent interface', () => {
    const event = new DatabaseImportedEvent({
      databaseId: 'db123',
      workspaceId: 'ws123',
      ownerId: 'user123',
      occurredAt: new Date(),
    });
    
    expect(typeof event.eventName).toBe('string');
    expect(event.occurredAt).toBeInstanceOf(Date);
  });

  it('should have correct properties', () => {
    const occurredAt = new Date();
    const event = new DatabaseImportedEvent({
      databaseId: 'db123',
      workspaceId: 'ws123',
      ownerId: 'user123',
      occurredAt,
    });
    
    expect(event.eventName).toBe('DatabaseImported');
    expect(event.databaseId).toBe('db123');
    expect(event.workspaceId).toBe('ws123');
    expect(event.ownerId).toBe('user123');
    expect(event.occurredAt).toBe(occurredAt);
  });
});
