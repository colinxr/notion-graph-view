import { PageProperty } from '../page-property.value-object';
import { IValueObject } from '../../../../shared/kernel/interfaces/value-object.interface';

describe('PageProperty', () => {
  it('should be defined', () => {
    const property = new PageProperty({
      id: 'prop123',
      name: 'Status',
      type: 'select',
      value: 'In Progress',
    });
    
    expect(property).toBeDefined();
  });

  it('should implement ValueObject interface', () => {
    const property = new PageProperty({
      id: 'prop123',
      name: 'Status',
      type: 'select',
      value: 'In Progress',
    });
    
    expect(typeof property.equals).toBe('function');
  });

  it('should have correct properties', () => {
    const property = new PageProperty({
      id: 'prop123',
      name: 'Status',
      type: 'select',
      value: 'In Progress',
    });
    
    expect(property.id).toBe('prop123');
    expect(property.name).toBe('Status');
    expect(property.type).toBe('select');
    expect(property.value).toBe('In Progress');
  });

  it('should handle different property types correctly', () => {
    const textProperty = new PageProperty({
      id: 'prop1',
      name: 'Description',
      type: 'text',
      value: 'This is a description',
    });
    
    const numberProperty = new PageProperty({
      id: 'prop2',
      name: 'Priority',
      type: 'number',
      value: 5,
    });
    
    const dateProperty = new PageProperty({
      id: 'prop3',
      name: 'Deadline',
      type: 'date',
      value: new Date('2023-12-31'),
    });
    
    expect(textProperty.value).toBe('This is a description');
    expect(numberProperty.value).toBe(5);
    expect(dateProperty.value).toBeInstanceOf(Date);
  });

  it('should correctly check equality', () => {
    const prop1 = new PageProperty({
      id: 'prop123',
      name: 'Status',
      type: 'select',
      value: 'In Progress',
    });
    
    const prop2 = new PageProperty({
      id: 'prop123',
      name: 'Status',
      type: 'select',
      value: 'In Progress',
    });
    
    const prop3 = new PageProperty({
      id: 'prop123',
      name: 'Status',
      type: 'select',
      value: 'Done',
    });
    
    expect(prop1.equals(prop2)).toBeTruthy();
    expect(prop1.equals(prop3)).toBeFalsy();
  });
});
