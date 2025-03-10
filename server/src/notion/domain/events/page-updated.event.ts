import { IDomainEvent } from '../../../shared/kernel/interfaces/domain-event.interface';

export interface PageUpdatedEventProps {
  pageId: string;
  databaseId: string;
  occurredOn: Date;
  changes?: string[];
}

export class PageUpdatedEvent implements IDomainEvent {
  private readonly _eventName: string = 'PageUpdated';
  private readonly _pageId: string;
  private readonly _databaseId: string;
  private readonly _occurredOn: Date;
  private readonly _changes?: string[];

  constructor(props: PageUpdatedEventProps) {
    this._pageId = props.pageId;
    this._databaseId = props.databaseId;
    this._occurredOn = props.occurredOn;
    this._changes = props.changes;
  }

  get eventName(): string {
    return this._eventName;
  }

  get pageId(): string {
    return this._pageId;
  }

  get databaseId(): string {
    return this._databaseId;
  }

  get occurredOn(): Date {
    return this._occurredOn;
  }

  get changes(): string[] | undefined {
    return this._changes ? [...this._changes] : undefined;
  }
}
