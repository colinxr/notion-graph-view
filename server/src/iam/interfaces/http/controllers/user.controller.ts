import { Controller, Get, Param, UseGuards, Req, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from '../../../application/services/user.service';
import { UserDto, UserListDto } from '../../../application/dtos/user.dto';
import { AuthGuard } from '../guards/auth.guard';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

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

  @Get('me')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Returns current user profile',
    type: UserDto
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'User not found' 
  })
  async getCurrentUser(@Req() request: any): Promise<UserDto> {
    const userId = request.user.sub;
    return this.userService.findById(userId);
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

  @Get('email/:email')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user by email' })
  @ApiParam({ name: 'email', description: 'User email' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Returns user by email',
    type: UserDto
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'User not found' 
  })
  async findByEmail(@Param('email') email: string): Promise<UserDto> {
    return this.userService.findByEmail(email);
  }

  @Get('notion-workspace/:workspaceId')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user by Notion workspace ID' })
  @ApiParam({ name: 'workspaceId', description: 'Notion workspace ID' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Returns user by Notion workspace ID',
    type: UserDto
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'User not found' 
  })
  async findByNotionWorkspace(@Param('workspaceId') workspaceId: string): Promise<UserDto> {
    return this.userService.findByNotionWorkspace(workspaceId);
  }
} 