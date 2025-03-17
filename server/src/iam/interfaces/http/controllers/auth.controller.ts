import { Controller, Post, Body, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from '../../../application/services/auth.service';
import { 
  RegisterUserDto, 
  LoginUserDto, 
  NotionAuthDto 
} from '../../../application/dtos/auth-request.dto';
import { AuthResponseDto } from '../../../application/dtos/auth-response.dto';
import { AuthGuard } from '../guards/auth.guard';
import { ClerkAuthGuard } from '../guards/clerk-auth.guard';
import { ClerkService } from '../../../infrastructure/clerk/clerk.service';
import { ClerkUser } from '../decorators/clerk-user.decorator';
import { ClerkAuthUser } from '../../../application/dtos/clerk-session.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly clerkService: ClerkService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'User successfully registered',
    type: AuthResponseDto
  })
  @ApiResponse({ 
    status: HttpStatus.CONFLICT, 
    description: 'User already exists' 
  })
  async register(@Body() dto: RegisterUserDto): Promise<AuthResponseDto> {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Login successful',
    type: AuthResponseDto
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED, 
    description: 'Invalid credentials' 
  })
  async login(@Body() dto: LoginUserDto): Promise<AuthResponseDto> {
    return this.authService.login(dto);
  }

  @Post('notion/connect')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Connect Notion account' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Notion account connected successfully',
    type: AuthResponseDto
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED, 
    description: 'User not authenticated or not found' 
  })
  async connectNotion(
    @Req() request: any,
    @Body() dto: NotionAuthDto
  ): Promise<AuthResponseDto> {
    const userId = request.user.sub;
    return this.authService.connectNotion(userId, dto);
  }
  
  @Post('clerk/notion/connect')
  @UseGuards(ClerkAuthGuard)
  @ApiOperation({ summary: 'Connect Notion account using Clerk authentication' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Notion account connected successfully',
    type: AuthResponseDto
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED, 
    description: 'User not authenticated or not found' 
  })
  async connectNotionWithClerk(
    @ClerkUser() user: ClerkAuthUser,
    @Body() dto: NotionAuthDto
  ): Promise<AuthResponseDto> {
    // Update Notion token in Clerk
    await this.clerkService.updateNotionAccessToken(user.id, dto.accessToken);
    
    // Connect Notion through the authService
    return this.authService.connectNotion(user.id, dto);
  }
} 