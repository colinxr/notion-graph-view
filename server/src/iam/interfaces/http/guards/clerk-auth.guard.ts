import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ClerkService } from '../../../infrastructure/clerk/clerk.service';

interface RequestWithAuth extends Request {
  auth: {
    userId: string;
    notionAccessToken: string;
    sessionId: string;
  };
}

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  constructor(
    private readonly clerkService: ClerkService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithAuth>();
    
    try {
      // Validate the request using Clerk
      const sessionContext = await this.clerkService.validateRequest(request);
      
      // Add the user context to the request for use in controllers
      request.auth = {
        userId: sessionContext.userId,
        notionAccessToken: sessionContext.notionAccessToken,
        sessionId: sessionContext.sessionId,
      };
      
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid authentication');
    }
  }
} 