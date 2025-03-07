import { IValueObject } from '../../../shared/kernel/interfaces/value-object.interface';

export class AuthToken implements IValueObject<AuthToken> {
  constructor(
    private readonly token: string,
    private readonly expiresAt: Date
  ) {}

  equals(other: AuthToken): boolean {
    return this.token === other.token && 
           this.expiresAt.getTime() === other.expiresAt.getTime();
  }

  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  getToken(): string {
    return this.token;
  }

  getExpiresAt(): Date {
    return this.expiresAt;
  }

  // Factory method for creating tokens with standard expiration
  static create(token: string, expirationHours: number = 24): AuthToken {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expirationHours);
    return new AuthToken(token, expiresAt);
  }
} 