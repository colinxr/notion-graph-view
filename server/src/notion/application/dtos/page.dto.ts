import { BacklinkDto } from './backlink.dto';

export class PagePropertyDto {
  id: string;
  name: string;
  type: string;
  value: any;
}

export class NotionPageDto {
  id: string;
  title: string;
  databaseId: string;
  url: string;
  content?: string;
  properties: PagePropertyDto[];
  backlinks: BacklinkDto[];
  createdAt: Date;
  updatedAt: Date;
}

export class PageSyncResultDto {
  pageId: string;
  databaseId: string;
  backlinkCount: number;
  contentUpdated: boolean;
  propertiesUpdated: boolean;
  syncedAt: Date;
} 