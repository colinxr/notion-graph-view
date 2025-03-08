import { ApiProperty } from '@nestjs/swagger';
import { BacklinkDto } from './backlink.dto';

export class PagePropertyDto {
  @ApiProperty({
    description: 'Unique identifier for the page property',
    example: 'prop_123456789'
  })
  id: string;

  @ApiProperty({
    description: 'Name of the property',
    example: 'Status'
  })
  name: string;

  @ApiProperty({
    description: 'Type of the property (e.g., select, date, text)',
    example: 'select'
  })
  type: string;

  @ApiProperty({
    description: 'Value of the property, can be of different types',
    example: 'In Progress'
  })
  value: any;
}

export class NotionPageDto {
  @ApiProperty({
    description: 'Unique identifier for the page',
    example: 'page_123456789'
  })
  id: string;

  @ApiProperty({
    description: 'Title of the page',
    example: 'Project Kickoff'
  })
  title: string;

  @ApiProperty({
    description: 'ID of the database that contains this page',
    example: 'db_123456789'
  })
  databaseId: string;

  @ApiProperty({
    description: 'URL to the page in Notion',
    example: 'https://notion.so/workspace/page-123456789'
  })
  url: string;

  @ApiProperty({
    description: 'Markdown content of the page',
    example: '# Project Kickoff\nThis is the kickoff meeting for our new project...',
    required: false
  })
  content?: string;

  @ApiProperty({
    description: 'List of properties for the page',
    type: [PagePropertyDto]
  })
  properties: PagePropertyDto[];

  @ApiProperty({
    description: 'List of backlinks referencing this page',
    type: [BacklinkDto]
  })
  backlinks: BacklinkDto[];

  @ApiProperty({
    description: 'Timestamp when the page was created',
    example: '2023-01-01T10:00:00.000Z'
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Timestamp when the page was last updated',
    example: '2023-01-15T12:30:45.123Z'
  })
  updatedAt: Date;
}

export class PageSyncResultDto {
  @ApiProperty({
    description: 'ID of the page that was synced',
    example: 'page_123456789'
  })
  pageId: string;

  @ApiProperty({
    description: 'ID of the database containing the page',
    example: 'db_123456789'
  })
  databaseId: string;

  @ApiProperty({
    description: 'Number of backlinks found and extracted',
    example: 3
  })
  backlinkCount: number;

  @ApiProperty({
    description: 'Whether the page content was updated during sync',
    example: true
  })
  contentUpdated: boolean;

  @ApiProperty({
    description: 'Whether any page properties were updated during sync',
    example: false
  })
  propertiesUpdated: boolean;

  @ApiProperty({
    description: 'Timestamp when the sync was completed',
    example: '2023-01-15T12:30:45.123Z'
  })
  syncedAt: Date;
} 