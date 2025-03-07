// src/notion/domain/models/notion-page.entity.ts
import { IEntity } from '../../../shared/kernel/interfaces/entity.interface';
import { IDomainEvent } from '../../../shared/kernel/interfaces/domain-event.interface';
import { PageProperty } from './page-property.value-object';
import { Backlink } from './backlink.value-object';
import { PageUpdatedEvent } from '../events/page-updated.event';

export interface NotionPageProps {
  id: string;
  title: string;
  databaseId: string;
  url: string;
  createdAt: Date;
  updatedAt: Date;
  content?: string;
  properties?: PageProperty[];
  backlinks?: Backlink[];
}

export class NotionPage implements IEntity {
  private _id: string;
  private _title: string;
  private _databaseId: string;
  private _url: string;
  private _createdAt: Date;
  private _updatedAt: Date;
  private _content?: string;
  private _properties: PageProperty[];
  private _backlinks: Backlink[];
  private _domainEvents: IDomainEvent[] = [];

  constructor(props: NotionPageProps) {
    this._id = props.id;
    this._title = props.title;
    this._databaseId = props.databaseId;
    this._url = props.url;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
    this._content = props.content;
    this._properties = props.properties || [];
    this._backlinks = props.backlinks || [];
  }

  // Properties
  get id(): string {
    return this._id;
  }

  get title(): string {
    return this._title;
  }

  get databaseId(): string {
    return this._databaseId;
  }

  get url(): string {
    return this._url;
  }

  get content(): string | undefined {
    return this._content;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  get properties(): PageProperty[] {
    return [...this._properties];
  }

  get backlinks(): Backlink[] {
    return [...this._backlinks];
  }

  get domainEvents(): IDomainEvent[] {
    return [...this._domainEvents];
  }

  // Methods
  addProperty(property: PageProperty): void {
    if (!this._properties.some(p => p.id === property.id)) {
      this._properties.push(property);
    }
  }

  getPropertyByName(name: string): PageProperty | undefined {
    return this._properties.find(p => p.name === name);
  }

  addBacklink(backlink: Backlink): void {
    if (!this._backlinks.some(b => b.id === backlink.id)) {
      this._backlinks.push(backlink);
    }
  }

  update(props: { title?: string; content?: string; updatedAt: Date }): void {
    if (props.title) {
      this._title = props.title;
    }
    
    if (props.content) {
      this._content = props.content;
    }
    
    this._updatedAt = props.updatedAt;
    
    // Add domain event
    this._domainEvents.push(
      new PageUpdatedEvent({
        pageId: this.id,
        databaseId: this.databaseId,
        occurredOn: props.updatedAt,
      })
    );
  }

  clearEvents(): void {
    this._domainEvents = [];
  }
}