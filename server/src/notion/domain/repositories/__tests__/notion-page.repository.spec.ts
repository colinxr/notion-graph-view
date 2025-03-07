import { INotionPageRepository } from '../notion-page.repository.interface';
import { NotionPage } from '../../models/notion-page.entity';

describe('INotionPageRepository', () => {
  // This is more of a type check than a real test
  it('should define all required methods', () => {
    // Create a mock implementation to verify the interface
    const mockRepository: INotionPageRepository = {
      findById: jest.fn(),
      findByDatabaseId: jest.fn(),
      findWithBacklinks: jest.fn(),
      findOutgoingBacklinks: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
      saveMany: jest.fn(),
      delete: jest.fn(),
    };
    
    expect(mockRepository.findById).toBeDefined();
    expect(mockRepository.findByDatabaseId).toBeDefined();
    expect(mockRepository.findWithBacklinks).toBeDefined();
    expect(mockRepository.findOutgoingBacklinks).toBeDefined();
    expect(mockRepository.save).toBeDefined();
    expect(mockRepository.saveMany).toBeDefined();
    expect(mockRepository.delete).toBeDefined();
    expect(mockRepository.findAll).toBeDefined();
  });
});
