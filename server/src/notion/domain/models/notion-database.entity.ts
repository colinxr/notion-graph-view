// src/notion/domain/models/notion-database.entity.ts
import { IAggregateRoot } from '../../../shared/kernel/interfaces/aggregate-root.interface';
import { IEntity } from '../../../shared/kernel/interfaces/entity.interface';
import { IDomainEvent } from '../../../shared/kernel/interfaces/domain-event.interface';
import { NotionPage } from './notion-page.entity';
import { DatabaseImportedEvent } from '../events/database-imported.event';

export interface NotionDatabaseProps {
  id: string;
  title: string;
  workspaceId: string;
  ownerId: string;
  lastSyncedAt: Date;
  pages?: NotionPage[];
  description?: string;
  url?: string;
  createdAt: Date;
  updatedAt: Date ;
}

export class NotionDatabase implements IEntity, IAggregateRoot {
  private _id: string;
  private _title: string;
  private _workspaceId: string;
  private _ownerId: string;
  private _lastSyncedAt: Date;
  private _pages: NotionPage[];
  private _description?: string;
  private _url?: string;
  private _domainEvents: IDomainEvent[] = [];
  private _createdAt: Date;
  private _updatedAt: Date ;

  constructor(props: NotionDatabaseProps) {
    this._id = props.id;
    this._title = props.title;
    this._workspaceId = props.workspaceId;
    this._ownerId = props.ownerId;
    this._lastSyncedAt = props.lastSyncedAt;
    this._pages = props.pages || [];
    this._description = props.description;
    this._url = props.url;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt
  }

  // Properties
  get id(): string {
    return this._id;
  }

  get title(): string {
    return this._title;
  }

  get workspaceId(): string {
    return this._workspaceId;
  }

  get ownerId(): string {
    return this._ownerId;
  }

  get lastSyncedAt(): Date {
    return this._lastSyncedAt;
  }

  get description(): string | undefined {
    return this._description;
  }

  get url(): string | undefined {
    return this._url;
  }

  get pages(): NotionPage[] {
    return [...this._pages];
  }

  get domainEvents(): IDomainEvent[] {
    return [...this._domainEvents];
  }

  get createdAt(): Date {
    return this._createdAt
  }

  get updatedAt(): Date {
    return this._updatedAt
  }

  // Methods
  addPage(page: NotionPage): void {
    if (!this._pages.some(p => p.id === page.id)) {
      this._pages.push(page);
    }
  }


  getPages(): NotionPage[] {
    return this.pages;
  }

  markAsSynced(syncTime: Date): void {
    this._lastSyncedAt = syncTime;
    
    // Add domain event
    this._domainEvents.push(
      new DatabaseImportedEvent({
        databaseId: this.id,
        workspaceId: this.workspaceId,
        ownerId: this.ownerId,
        occurredOn: syncTime,
      })
    );
  }

  addEvent(event: IDomainEvent): void {
    this._domainEvents.push(event);
  }

  clearEvents(): void {
    this._domainEvents = [];
  }
}