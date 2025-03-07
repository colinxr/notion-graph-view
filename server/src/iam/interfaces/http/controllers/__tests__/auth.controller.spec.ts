import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthController } from '../auth.controller';
import { AuthService } from '../../../../application/services/auth.service';
import { RegisterUserDto, LoginUserDto, NotionAuthDto } from '../../../../application/dtos/auth-request.dto';
import { AuthResponseDto } from '../../../../application/dtos/auth-response.dto';
import { AuthGuard } from '../../guards/auth.guard';

// Create a mock AuthGuard to avoid the actual implementation
class MockAuthGuard {
  canActivate = jest.fn().mockImplementation(() => true);
}

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  // Sample DTOs
  const registerDto: RegisterUserDto = {
    email: 'test@example.com',
    name: 'Test User',
    password: 'password123',
  };

  const loginDto: LoginUserDto = {
    email: 'test@example.com',
    password: 'password123',
  };

  const notionDto: NotionAuthDto = {
    accessToken: 'notion_token',
    workspaceId: 'workspace_id',
  };

  // Sample response
  const authResponse: AuthResponseDto = {
    id: 'test_id',
    email: 'test@example.com',
    name: 'Test User',
    token: {
      token: 'jwt_token',
      expiresAt: new Date(),
    },
    hasNotionAccess: false,
  };

  beforeEach(async () => {
    // Create mock services
    const mockAuthService = {
      register: jest.fn(),
      login: jest.fn(),
      connectNotion: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: AuthGuard,
          useClass: MockAuthGuard,
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
            verifyAsync: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test-secret'),
          },
        },
      ],
    })
    // Override the guards at the controller level
    .overrideGuard(AuthGuard)
    .useClass(MockAuthGuard)
    .compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      // Arrange
      authService.register.mockResolvedValue(authResponse);

      // Act
      const result = await controller.register(registerDto);

      // Assert
      expect(result).toEqual(authResponse);
      expect(authService.register).toHaveBeenCalledWith(registerDto);
    });

    it('should forward ConflictException when user already exists', async () => {
      // Arrange
      authService.register.mockRejectedValue(new ConflictException('User already exists'));

      // Act & Assert
      await expect(controller.register(registerDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      // Arrange
      authService.login.mockResolvedValue(authResponse);

      // Act
      const result = await controller.login(loginDto);

      // Assert
      expect(result).toEqual(authResponse);
      expect(authService.login).toHaveBeenCalledWith(loginDto);
    });

    it('should forward UnauthorizedException when credentials are invalid', async () => {
      // Arrange
      authService.login.mockRejectedValue(new UnauthorizedException('Invalid credentials'));

      // Act & Assert
      await expect(controller.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('connectNotion', () => {
    it('should connect notion successfully', async () => {
      // Arrange
      const userId = 'test_user_id';
      const mockRequest = { user: { sub: userId } };
      authService.connectNotion.mockResolvedValue(authResponse);

      // Act
      const result = await controller.connectNotion(mockRequest as any, notionDto);

      // Assert
      expect(result).toEqual(authResponse);
      expect(authService.connectNotion).toHaveBeenCalledWith(userId, notionDto);
    });

    it('should forward UnauthorizedException when user not found', async () => {
      // Arrange
      const userId = 'test_user_id';
      const mockRequest = { user: { sub: userId } };
      authService.connectNotion.mockRejectedValue(new UnauthorizedException('User not found'));

      // Act & Assert
      await expect(controller.connectNotion(mockRequest as any, notionDto)).rejects.toThrow(UnauthorizedException);
    });
  });
}); 