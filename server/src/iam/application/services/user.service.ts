import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { User } from '../../domain/models/user.entity';
import { UserDto, UserListDto } from '../dtos/user.dto';

@Injectable()
export class UserService {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async findById(id: string): Promise<UserDto> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.toUserDto(user);
  }

  async findByEmail(email: string): Promise<UserDto> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.toUserDto(user);
  }

  async findByNotionWorkspace(workspaceId: string): Promise<UserDto> {
    const user = await this.userRepository.findByNotionWorkspaceId(workspaceId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.toUserDto(user);
  }

  async findAll(): Promise<UserListDto> {
    const users = await this.userRepository.findAll();
    return {
      users: users.map(user => this.toUserDto(user)),
      total: users.length,
    };
  }

  private toUserDto(user: User): UserDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      isAuthenticated: user.isAuthenticated(),
      hasNotionAccess: user.hasNotionAccess(),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
} 