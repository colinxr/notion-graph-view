import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

import { User } from '../../domain/models/user.entity';
import { AuthToken } from '../../domain/models/auth-token.value-object';
import { NotionCredentials } from '../../domain/models/notion-credentials.value-object';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { EventBusService } from '../../../shared/infrastructure/event-bus/event-bus.service';

import { RegisterUserDto, LoginUserDto, NotionAuthDto } from '../dtos/auth-request.dto';
import { AuthResponseDto } from '../dtos/auth-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly eventBus: EventBusService,
  ) {}

  async register(dto: RegisterUserDto): Promise<AuthResponseDto> {
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Create new user
    const user = User.create(
      uuidv4(),
      dto.email,
      dto.name,
    );

    // Save user
    await this.userRepository.save(user);

    // Generate JWT token
    const token = await this.generateToken(user);

    // Publish domain events
    await this.eventBus.publishAll(user.domainEvents);
    user.clearEvents();

    return this.toAuthResponse(user, token);
  }

  async login(dto: LoginUserDto): Promise<AuthResponseDto> {
    // Find user
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password (in a real app, this would be against a hashed password in the user entity)
    const isPasswordValid = await bcrypt.compare(dto.password, 'hashedPassword');
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const token = await this.generateToken(user);

    // Update user's auth token
    user.setAuthToken(token);
    await this.userRepository.save(user);

    // Publish domain events
    await this.eventBus.publishAll(user.domainEvents);
    user.clearEvents();

    return this.toAuthResponse(user, token);
  }

  async connectNotion(userId: string, dto: NotionAuthDto): Promise<AuthResponseDto> {
    // Find user
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Create Notion credentials
    const credentials = NotionCredentials.create(
      dto.accessToken,
      dto.workspaceId,
    );

    // Update user's Notion credentials
    user.setNotionCredentials(credentials);
    await this.userRepository.save(user);

    // Generate new JWT token
    const token = await this.generateToken(user);

    return this.toAuthResponse(user, token);
  }

  private async generateToken(user: User): Promise<AuthToken> {
    const payload = { 
      sub: user.id,
      email: user.email,
      hasNotionAccess: user.hasNotionAccess()
    };

    const token = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: '24h'
    });

    return AuthToken.create(token);
  }

  private toAuthResponse(user: User, token: AuthToken): AuthResponseDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      token: {
        token: token.getToken(),
        expiresAt: token.getExpiresAt(),
      },
      hasNotionAccess: user.hasNotionAccess(),
    };
  }
} 