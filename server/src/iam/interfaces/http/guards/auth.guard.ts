import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

// Extend the Express Request interface
interface RequestWithUser extends Request {
  user: any;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const token = this.extractTokenFromHeader(request);
    
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const secret = this.configService.get<string>('JWT_SECRET') || '';
      const payload = await this.verifyToken(token, secret);
      
      // Assign payload to request.user for use in controllers
      request.user = payload;
      
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  // Extract for easier testing
  async verifyToken(token: string, secret: string): Promise<any> {
    return await this.jwtService.verifyAsync(token, { secret });
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') || [];
    return type === 'Bearer' ? token : undefined;
  }
} 