import { IRepository } from '../../../shared/kernel/interfaces/repository.interface';
import { NotionDatabase } from '../models/notion-database.entity';

export interface INotionDatabaseRepository extends IRepository<NotionDatabase> {
  findById(id: string): Promise<NotionDatabase | null>;
  findByWorkspaceId(workspaceId: string): Promise<NotionDatabase[]>;
  findByOwnerId(ownerId: string): Promise<NotionDatabase[]>;
  findAll(): Promise<NotionDatabase[]>
  save(database: NotionDatabase): Promise<void>;
  delete(id: string): Promise<void>;
}
