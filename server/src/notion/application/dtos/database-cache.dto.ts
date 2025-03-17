import { ApiProperty } from '@nestjs/swagger';

/**
 * Lightweight DTO for database information stored in Redis cache
 */
export class CachedDatabaseDto {
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
    description: 'URL to the database in Notion',
    example: 'https://notion.so/workspace/db-123456789',
    required: false
  })
  url?: string;

  @ApiProperty({
    description: 'Optional icon URL or emoji for the database',
    example: 'https://notion.com/icons/database.png',
    required: false
  })
  icon?: string;

  @ApiProperty({
    description: 'Timestamp when the database was last cached',
    example: '2023-01-15T12:30:45.123Z'
  })
  cachedAt: Date;
}

/**
 * Collection of cached databases for a user
 */
export class CachedDatabasesListDto {
  @ApiProperty({
    description: 'List of cached database information',
    type: [CachedDatabaseDto],
  })
  databases: CachedDatabaseDto[];

  @ApiProperty({
    description: 'Timestamp when the databases list was cached',
    example: '2023-01-15T12:30:45.123Z'
  })
  cachedAt: Date;
} 