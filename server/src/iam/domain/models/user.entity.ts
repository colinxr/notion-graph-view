import { IAggregateRoot } from '../../../shared/kernel/interfaces/aggregate-root.interface';
import { IDomainEvent } from '../../../shared/kernel/interfaces/domain-event.interface';
import { NotionCredentials } from './notion-credentials.value-object';
import { AuthToken } from './auth-token.value-object';
import { UserRegisteredEvent } from '../events/user-registered.event';
import { UserAuthenticatedEvent } from '../events/user-authenticated.event';

export class User implements IAggregateRoot {
  private _domainEvents: IDomainEvent[] = [];

  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly name: string,
    private _notionCredentials?: NotionCredentials,
    private _authToken?: AuthToken,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date(),
  ) {}

  // Domain Events
  get domainEvents(): IDomainEvent[] {
    return this._domainEvents;
  }

  clearEvents(): void {
    this._domainEvents = [];
  }

  addEvent(event: IDomainEvent): void {
    this._domainEvents.push(event);
  }

  // Notion Credentials
  get notionCredentials(): NotionCredentials | undefined {
    return this._notionCredentials;
  }

  setNotionCredentials(credentials: NotionCredentials): void {
    this._notionCredentials = credentials;
  }

  // Auth Token
  get authToken(): AuthToken | undefined {
    return this._authToken;
  }

  setAuthToken(token: AuthToken): void {
    this._authToken = token;
    this.addEvent(new UserAuthenticatedEvent(this.id, new Date()));
  }

  // Factory Methods
  static create(
    id: string,
    email: string,
    name: string,
  ): User {
    const user = new User(id, email, name);
    user.addEvent(new UserRegisteredEvent(id, email, name, new Date()));
    return user;
  }

  // Domain Logic
  isAuthenticated(): boolean {
    return this._authToken !== undefined && !this._authToken.isExpired();
  }

  hasNotionAccess(): boolean {
    return this._notionCredentials !== undefined && !this._notionCredentials.isExpired();
  }
} 