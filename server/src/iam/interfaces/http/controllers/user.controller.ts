import { Controller, Get, Param, UseGuards, Req, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from '../../../application/services/user.service';
import { UserDto, UserListDto } from '../../../application/dtos/user.dto';
import { AuthGuard } from '../guards/auth.guard';
import { ClerkAuthGuard } from '../guards/clerk-auth.guard';
import { ClerkUser } from '../decorators/clerk-user.decorator';
import { ClerkAuthUser } from '../../../application/dtos/clerk-session.dto';
import { ClerkService } from '../../../infrastructure/clerk/clerk.service';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly clerkService: ClerkService,
  ) {}

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Returns list of all users',
    type: UserListDto
  })
  async findAll(): Promise<UserListDto> {
    return this.userService.findAll();
  }

  @Get('clerk/me')
  @UseGuards(ClerkAuthGuard)
  @ApiOperation({ summary: 'Get current user profile using Clerk authentication' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Returns current user profile',
    type: UserDto
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'User not found' 
  })
  async getClerkCurrentUser(@ClerkUser() user: ClerkAuthUser): Promise<UserDto> {
    // First check if user exists in our database
    try {
      return await this.userService.findById(user.id);
    } catch (error) {
      // Get detailed user info from Clerk
      const clerkUserInfo = await this.clerkService.getUserInfo(user.id);
      
      // Return a simplified user DTO with Clerk user data
      return {
        id: clerkUserInfo.id,
        email: clerkUserInfo.email,
        name: clerkUserInfo.email.split('@')[0], // Use part of the email as a name
        isAuthenticated: true,
        hasNotionAccess: clerkUserInfo.notionConnected,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Returns user by ID',
    type: UserDto
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'User not found' 
  })
  async findById(@Param('id') id: string): Promise<UserDto> {
    return this.userService.findById(id);
  }
}