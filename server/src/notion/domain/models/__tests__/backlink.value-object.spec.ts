// src/notion/domain/models/__tests__/backlink.value-object.spec.ts
import { Backlink } from '../backlink.value-object';
import { IValueObject } from '../../../../shared/kernel/interfaces/value-object.interface';

describe('Backlink', () => {
  it('should be defined', () => {
    const backlink = new Backlink({
      id: 'link123',
      sourcePageId: 'source123',
      sourcePageTitle: 'Source Page',
      targetPageId: 'target123',
      createdAt: new Date(),
    });
    
    expect(backlink).toBeDefined();
  });

  it('should implement ValueObject interface', () => {
    const backlink = new Backlink({
      id: 'link123',
      sourcePageId: 'source123',
      sourcePageTitle: 'Source Page',
      targetPageId: 'target123',
      createdAt: new Date(),
    });
    
    expect(typeof backlink.equals).toBe('function');
  });

  it('should have correct properties', () => {
    const createdAt = new Date();
    const backlink = new Backlink({
      id: 'link123',
      sourcePageId: 'source123',
      sourcePageTitle: 'Source Page',
      targetPageId: 'target123',
      createdAt,
    });
    
    expect(backlink.id).toBe('link123');
    expect(backlink.sourcePageId).toBe('source123');
    expect(backlink.sourcePageTitle).toBe('Source Page');
    expect(backlink.targetPageId).toBe('target123');
    expect(backlink.createdAt).toBe(createdAt);
  });

  it('should correctly check equality', () => {
    const backlink1 = new Backlink({
      id: 'link123',
      sourcePageId: 'source123',
      sourcePageTitle: 'Source Page',
      targetPageId: 'target123',
      createdAt: new Date('2023-01-01'),
    });
    
    const backlink2 = new Backlink({
      id: 'link123',
      sourcePageId: 'source123',
      sourcePageTitle: 'Source Page',
      targetPageId: 'target123',
      createdAt: new Date('2023-01-01'),
    });
    
    const backlink3 = new Backlink({
      id: 'link456',
      sourcePageId: 'source123',
      sourcePageTitle: 'Source Page',
      targetPageId: 'target123',
      createdAt: new Date('2023-01-01'),
    });
    
    expect(backlink1.equals(backlink2)).toBeTruthy();
    expect(backlink1.equals(backlink3)).toBeFalsy();
  });
});