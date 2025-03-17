import { IDomainEvent } from '../../../shared/kernel/interfaces/domain-event.interface';
import { NotionDatabaseDto } from '../../application/dtos/database.dto';

export class DatabasesFetchedEvent implements IDomainEvent {
  static readonly EVENT_NAME = 'notion.databases.fetched';
  
  readonly eventName = DatabasesFetchedEvent.EVENT_NAME;
  readonly occurredOn: Date;
  
  constructor(
    readonly userId: string,
    readonly databases: NotionDatabaseDto[],
    readonly cacheKey: string,
  ) {
    this.occurredOn = new Date();
  }
} 