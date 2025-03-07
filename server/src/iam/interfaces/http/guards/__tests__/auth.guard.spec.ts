import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '../auth.guard';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    // Create mock services
    const mockJwtService = {
      verifyAsync: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);
    jwtService = module.get(JwtService);
    configService = module.get(ConfigService);

    // Default configuration
    configService.get.mockReturnValue('test_secret');
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should allow access for valid JWT token', async () => {
      // Arrange
      const userData = { sub: 'test_id', email: 'test@example.com' };
      
      // Spy on the verifyToken method instead of mocking JwtService
      jest.spyOn(guard, 'verifyToken').mockResolvedValueOnce(userData);

      const mockContext = createMockExecutionContext('Bearer valid_token');
      
      // Act
      const result = await guard.canActivate(mockContext);

      // Assert
      expect(result).toBe(true);
      expect(guard.verifyToken).toHaveBeenCalledWith('valid_token', 'test_secret');
      expect(mockContext.switchToHttp().getRequest().user).toEqual(userData);
    });

    it('should deny access when no authorization header is present', async () => {
      // Arrange
      const mockContext = createMockExecutionContext(undefined);

      // Act & Assert
      await expect(guard.canActivate(mockContext)).rejects.toThrow(UnauthorizedException);
    });

    it('should deny access when token is malformed', async () => {
      // Arrange
      const mockContext = createMockExecutionContext('not_a_bearer_token');

      // Act & Assert
      await expect(guard.canActivate(mockContext)).rejects.toThrow(UnauthorizedException);
    });

    it('should deny access when JWT verification fails', async () => {
      // Arrange
      jwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));
      const mockContext = createMockExecutionContext('Bearer invalid_token');

      // Act & Assert
      await expect(guard.canActivate(mockContext)).rejects.toThrow(UnauthorizedException);
    });
  });

  // Helper function to create mock execution context
  function createMockExecutionContext(authHeader: string | undefined): ExecutionContext {
    const mockRequest = {
      headers: authHeader ? { authorization: authHeader } : {},
    };

    return {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as ExecutionContext;
  }
}); 