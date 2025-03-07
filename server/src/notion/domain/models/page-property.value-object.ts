import { IValueObject } from '../../../shared/kernel/interfaces/value-object.interface';

export type PropertyType = 'text' | 'number' | 'select' | 'multi_select' | 'date' | 'person' | 'file' | 'checkbox' | 'url' | 'email' | 'phone_number' | 'formula' | 'relation' | 'rollup' | 'created_time' | 'created_by' | 'last_edited_time' | 'last_edited_by';

export type PropertyValue = string | number | boolean | Date | Array<string> | null;

export interface PagePropertyProps {
  id: string;
  name: string;
  type: PropertyType;
  value: PropertyValue;
}

export class PageProperty implements IValueObject<PageProperty> {
  private readonly _id: string;
  private readonly _name: string;
  private readonly _type: PropertyType;
  private readonly _value: PropertyValue;

  constructor(props: PagePropertyProps) {
    this._id = props.id;
    this._name = props.name;
    this._type = props.type;
    this._value = props.value;
  }

  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get type(): PropertyType {
    return this._type;
  }

  get value(): PropertyValue {
    return this._value;
  }

  equals(other: PageProperty): boolean {
    if (!(other instanceof PageProperty)) return false;
    
    // For simple values, compare directly
    if (typeof this.value !== 'object' && this.value !== null) {
      return this.id === other.id && 
             this.name === other.name && 
             this.type === other.type && 
             this.value === other.value;
    }
    
    // For date values
    if (this.value instanceof Date && other.value instanceof Date) {
      return this.id === other.id && 
             this.name === other.name && 
             this.type === other.type && 
             this.value.getTime() === other.value.getTime();
    }
    
    // For array values
    if (Array.isArray(this.value) && Array.isArray(other.value)) {
      return this.id === other.id && 
             this.name === other.name && 
             this.type === other.type && 
             this.value.length === other.value.length &&
             this.value.every((v, i) => v === other.value[i]);
    }
    
    // For null values
    if (this.value === null && other.value === null) {
      return this.id === other.id && 
             this.name === other.name && 
             this.type === other.type;
    }
    
    return false;
  }
}
