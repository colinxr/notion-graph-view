import { IRepository } from '../../../shared/kernel/interfaces/repository.interface';
import { NotionPage } from '../models/notion-page.entity';

export interface INotionPageRepository extends IRepository<NotionPage> {
  findById(id: string): Promise<NotionPage | null>;
  findByDatabaseId(databaseId: string): Promise<NotionPage[]>;
  findWithBacklinks(pageId: string): Promise<NotionPage | null>;
  findOutgoingBacklinks(pageId: string): Promise<NotionPage[]>;
  findAll(): Promise<NotionPage[]>;
  save(page: NotionPage): Promise<void>;
  saveMany(pages: NotionPage[]): Promise<void>;
  delete(id: string): Promise<void>;
}
