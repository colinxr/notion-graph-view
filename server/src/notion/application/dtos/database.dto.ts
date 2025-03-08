export class NotionDatabaseDto {
  id: string;
  title: string;
  workspaceId: string;
  ownerId: string;
  lastSyncedAt: Date;
  description?: string;
  url?: string;
  createdAt: Date;
  updatedAt: Date;
  pageCount?: number;
}

export class DatabaseSyncResultDto {
  databaseId: string;
  newPages: number;
  updatedPages: number;
  totalPages: number;
  syncedAt: Date;
} 