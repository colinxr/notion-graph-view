import { IEntity } from './entity.interface';
import { IDomainEvent } from './domain-event.interface';

export interface IAggregateRoot extends IEntity {
  domainEvents: IDomainEvent[];
  clearEvents(): void;
  addEvent(event: IDomainEvent): void;
} 