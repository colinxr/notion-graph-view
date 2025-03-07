import { PageUpdatedEvent } from '../page-updated.event';
import { IDomainEvent } from '../../../../shared/kernel/interfaces/domain-event.interface';

describe('PageUpdatedEvent', () => {
  it('should be defined', () => {
    const event = new PageUpdatedEvent({
      pageId: 'page123',
      databaseId: 'db123',
      occurredAt: new Date(),
    });
    
    expect(event).toBeDefined();
  });

  it('should implement IDomainEvent interface', () => {
    const event = new PageUpdatedEvent({
      pageId: 'page123',
      databaseId: 'db123',
      occurredAt: new Date(),
    });
    
    expect(typeof event.eventName).toBe('string');
    expect(event.occurredAt).toBeInstanceOf(Date);
  });

  it('should have correct properties', () => {
    const occurredAt = new Date();
    const event = new PageUpdatedEvent({
      pageId: 'page123',
      databaseId: 'db123',
      occurredAt,
      changes: ['title', 'content'],
    });
    
    expect(event.eventName).toBe('PageUpdated');
    expect(event.pageId).toBe('page123');
    expect(event.databaseId).toBe('db123');
    expect(event.occurredAt).toBe(occurredAt);
    expect(event.changes).toEqual(['title', 'content']);
  });
});
