import { INotionDatabaseRepository } from '../notion-database.repository.interface';
import { NotionDatabase } from '../../models/notion-database.entity';

describe('INotionDatabaseRepository', () => {
  // This is more of a type check than a real test
  it('should define all required methods', () => {
    // Create a mock implementation to verify the interface
    const mockRepository: INotionDatabaseRepository = {
      findById: jest.fn(),
      findByWorkspaceId: jest.fn(),
      findByOwnerId: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };
    
    expect(mockRepository.findById).toBeDefined();
    expect(mockRepository.findByWorkspaceId).toBeDefined();
    expect(mockRepository.findByOwnerId).toBeDefined();
    expect(mockRepository.save).toBeDefined();
    expect(mockRepository.delete).toBeDefined();
  });
});
