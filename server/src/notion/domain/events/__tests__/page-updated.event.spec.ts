import { PageUpdatedEvent } from '../page-updated.event';

describe('PageUpdatedEvent', () => {
  it('should be defined', () => {
    const event = new PageUpdatedEvent({
      pageId: 'page123',
      databaseId: 'db123',
      occurredOn: new Date(),
    });
    
    expect(event).toBeDefined();
  });

  it('should implement IDomainEvent interface', () => {
    const event = new PageUpdatedEvent({
      pageId: 'page123',
      databaseId: 'db123',
      occurredOn: new Date(),
    });
    
    expect(typeof event.eventName).toBe('string');
    expect(event.occurredOn).toBeInstanceOf(Date);
  });

  it('should have correct properties', () => {
    const occurredOn = new Date();
    const event = new PageUpdatedEvent({
      pageId: 'page123',
      databaseId: 'db123',
      occurredOn,
      changes: ['title', 'content'],
    });
    
    expect(event.eventName).toBe('PageUpdated');
    expect(event.pageId).toBe('page123');
    expect(event.databaseId).toBe('db123');
    expect(event.occurredOn).toBe(occurredOn);
    expect(event.changes).toEqual(['title', 'content']);
  });
});
