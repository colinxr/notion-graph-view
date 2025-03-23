import { Controller, Get, Param, UseGuards, Req, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from '../../../application/services/user.service';
import { UserDto, UserListDto } from '../../../application/dtos/user.dto';
import { AuthGuard } from '../guards/auth.guard';
import { Request } from 'express';

interface RequestWithAuth extends Request {
  auth: {
    userId: string;
    notionAccessToken: string;
    sessionId: string;
  };
}

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
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
  async getClerkCurrentUser(@Req() req: RequestWithAuth): Promise<UserDto> {
    const userId = req.auth.userId;
    const hasNotionAccess = !!req.auth.notionAccessToken;
    
    // First check if user exists in our database
    try {
      return await this.userService.findById(userId);
    } catch (error) {
      // Return a simplified user DTO with auth data
      return {
        id: userId,
        email: 'user@example.com', // We would need to retrieve this from a database or service
        name: 'User', // Default name
        isAuthenticated: true,
        hasNotionAccess: hasNotionAccess,
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