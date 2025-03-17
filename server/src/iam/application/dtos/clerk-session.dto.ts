import { ApiProperty } from '@nestjs/swagger';

/**
 * Interface representing Clerk session context
 */
export interface ClerkSessionContext {
  userId: string;
  notionAccessToken: string;
  sessionId: string;
}

/**
 * Interface representing Clerk authenticated user
 */
export interface ClerkAuthUser {
  id: string;
  email: string;
  notionConnected: boolean;
}

/**
 * DTO for Clerk session information
 */
export class ClerkSessionDto implements ClerkSessionContext {
  @ApiProperty({ example: 'user_2KV46z0Xh5JCFq7YrP5DewPNjRm' })
  userId: string;
  
  @ApiProperty({ example: 'secret_jA7eFn5BNrUZJzJjJKCQASm1jfgSzpkKy2GYvWaf9V' })
  notionAccessToken: string;
  
  @ApiProperty({ example: 'sess_2KV46z0Xh5JCFq7YrP5DewPNjRm' })
  sessionId: string;
}

/**
 * DTO for Clerk authenticated user
 */
export class ClerkUserDto implements ClerkAuthUser {
  @ApiProperty({ example: 'user_2KV46z0Xh5JCFq7YrP5DewPNjRm' })
  id: string;
  
  @ApiProperty({ example: 'user@example.com' })
  email: string;
  
  @ApiProperty({ example: true })
  notionConnected: boolean;
} 