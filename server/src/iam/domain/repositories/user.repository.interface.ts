import { IRepository } from '../../../shared/kernel/interfaces/repository.interface';
import { User } from '../models/user.entity';

export interface IUserRepository extends IRepository<User> {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByNotionWorkspaceId(workspaceId: string): Promise<User | null>;
} 