import { IDomainEvent } from '../../../shared/kernel/interfaces/domain-event.interface';

export interface DatabaseImportedEventProps {
  databaseId: string;
  workspaceId: string;
  ownerId: string;
  occurredOn: Date;
  pageCount?: number;
}

export class DatabaseImportedEvent implements IDomainEvent {
  private readonly _eventName: string = 'DatabaseImported';
  private readonly _databaseId: string;
  private readonly _workspaceId: string;
  private readonly _ownerId: string;
  private readonly _occurredOn: Date;
  private readonly _pageCount?: number;

  constructor(props: DatabaseImportedEventProps) {
    this._databaseId = props.databaseId;
    this._workspaceId = props.workspaceId;
    this._ownerId = props.ownerId;
    this._occurredOn = props.occurredOn;
    this._pageCount = props.pageCount;
  }

  get eventName(): string {
    return this._eventName;
  }

  get databaseId(): string {
    return this._databaseId;
  }

  get workspaceId(): string {
    return this._workspaceId;
  }

  get ownerId(): string {
    return this._ownerId;
  }

  get occurredOn(): Date {
    return this._occurredOn;
  }

  get pageCount(): number | undefined {
    return this._pageCount;
  }
}
