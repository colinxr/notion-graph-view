import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Request } from 'express';

interface RequestWithUser extends Request {
  user: {
    hasNotionAccess?: boolean;
    [key: string]: any;
  };
}

@Injectable()
export class SubscriptionGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    
    // Check if user exists and has Notion access
    if (!request.user || !request.user.hasNotionAccess) {
      throw new ForbiddenException('Notion access required');
    }
    
    return true;
  }
} 