import { ApiProperty } from '@nestjs/swagger';

export class BacklinkDto {
  @ApiProperty({
    description: 'Unique identifier for the backlink',
    example: 'bl_123456789'
  })
  id: string;

  @ApiProperty({
    description: 'ID of the source page that contains the backlink',
    example: 'page_abcdef123'
  })
  sourcePageId: string;

  @ApiProperty({
    description: 'Title of the source page',
    example: 'Meeting Notes'
  })
  sourcePageTitle: string;

  @ApiProperty({
    description: 'ID of the target page that is being linked to',
    example: 'page_xyz789'
  })
  targetPageId: string;

  @ApiProperty({
    description: 'Timestamp when the backlink was created',
    example: '2023-01-15T12:30:45.123Z'
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Surrounding text context of the backlink',
    example: 'As discussed in [[Project Plan]], we need to...',
    required: false
  })
  context?: string;
}

export class CreateBacklinkDto {
  @ApiProperty({
    description: 'ID of the source page that contains the backlink',
    example: 'page_abcdef123'
  })
  sourcePageId: string;

  @ApiProperty({
    description: 'Title of the source page',
    example: 'Meeting Notes'
  })
  sourcePageTitle: string;

  @ApiProperty({
    description: 'ID of the target page that is being linked to',
    example: 'page_xyz789'
  })
  targetPageId: string;

  @ApiProperty({
    description: 'Surrounding text context of the backlink',
    example: 'As discussed in [[Project Plan]], we need to...',
    required: false
  })
  context?: string;
} 