import { IValueObject } from '../../../shared/kernel/interfaces/value-object.interface';

export class NotionCredentials implements IValueObject<NotionCredentials> {
  constructor(
    private readonly accessToken: string,
    private readonly workspaceId: string,
    private readonly expiresAt: Date
  ) {}

  equals(other: NotionCredentials): boolean {
    return this.accessToken === other.accessToken && 
           this.workspaceId === other.workspaceId &&
           this.expiresAt.getTime() === other.expiresAt.getTime();
  }

  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  getAccessToken(): string {
    return this.accessToken;
  }

  getWorkspaceId(): string {
    return this.workspaceId;
  }

  getExpiresAt(): Date {
    return this.expiresAt;
  }

  // Factory method for creating credentials with standard expiration
  static create(
    accessToken: string,
    workspaceId: string,
    expirationHours: number = 720 // 30 days
  ): NotionCredentials {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expirationHours);
    return new NotionCredentials(accessToken, workspaceId, expiresAt);
  }
} 