import { ApiProperty } from '@nestjs/swagger';

export class NotionDatabaseDto {
  @ApiProperty({
    description: 'Unique identifier for the database',
    example: 'db_123456789'
  })
  id: string;

  @ApiProperty({
    description: 'Title of the database',
    example: 'Project Tasks'
  })
  title: string;

  @ApiProperty({
    description: 'ID of the workspace that contains the database',
    example: 'ws_123456789'
  })
  workspaceId: string;

  @ApiProperty({
    description: 'ID of the database owner',
    example: 'user_123456789'
  })
  ownerId: string;

  @ApiProperty({
    description: 'Timestamp of the last synchronization with Notion',
    example: '2023-01-15T12:30:45.123Z'
  })
  lastSyncedAt: Date;

  @ApiProperty({
    description: 'Optional description of the database',
    example: 'This database contains all project tasks',
    required: false
  })
  description?: string;

  @ApiProperty({
    description: 'URL to the database in Notion',
    example: 'https://notion.so/workspace/db-123456789',
    required: false
  })
  url?: string;

  @ApiProperty({
    description: 'Timestamp when the database was created',
    example: '2023-01-01T10:00:00.000Z'
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Timestamp when the database was last updated',
    example: '2023-01-15T12:30:45.123Z'
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Number of pages in the database',
    example: 42,
    required: false
  })
  pageCount?: number;
}

export class DatabaseSyncResultDto {
  @ApiProperty({
    description: 'ID of the database that was synced',
    example: 'db_123456789'
  })
  databaseId: string;

  @ApiProperty({
    description: 'Number of new pages created during sync',
    example: 5
  })
  newPages: number;

  @ApiProperty({
    description: 'Number of existing pages updated during sync',
    example: 10
  })
  updatedPages: number;

  @ApiProperty({
    description: 'Total number of pages in the database',
    example: 42
  })
  totalPages: number;

  @ApiProperty({
    description: 'Timestamp when the sync was completed',
    example: '2023-01-15T12:30:45.123Z'
  })
  syncedAt: Date;
} 