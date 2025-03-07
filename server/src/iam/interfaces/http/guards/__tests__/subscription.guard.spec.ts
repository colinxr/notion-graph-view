import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { SubscriptionGuard } from '../subscription.guard';

describe('SubscriptionGuard', () => {
  let guard: SubscriptionGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SubscriptionGuard],
    }).compile();

    guard = module.get<SubscriptionGuard>(SubscriptionGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should allow access when user has Notion access', () => {
      // Arrange
      const mockContext = createMockExecutionContext({ hasNotionAccess: true });

      // Act
      const result = guard.canActivate(mockContext);

      // Assert
      expect(result).toBe(true);
    });

    it('should deny access when user does not have Notion access', () => {
      // Arrange
      const mockContext = createMockExecutionContext({ hasNotionAccess: false });

      // Act & Assert
      expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(mockContext)).toThrow('Notion access required');
    });

    it('should deny access when user property is missing from request', () => {
      // Arrange
      const mockContext = createMockExecutionContext(undefined);

      // Act & Assert
      expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
    });
  });

  // Helper function to create mock execution context
  function createMockExecutionContext(user: any): ExecutionContext {
    const mockRequest = { user };

    return {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as ExecutionContext;
  }
}); 