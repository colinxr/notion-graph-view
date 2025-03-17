import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ClerkAuthUser } from '../../../application/dtos/clerk-session.dto';

/**
 * Parameter decorator that extracts the authenticated Clerk user from the request.
 * 
 * Usage:
 * ```typescript
 * @Get()
 * getItem(@ClerkUser() user: ClerkAuthUser) {
 *   // user contains the authenticated user information
 * }
 * ```
 */
export const ClerkUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): ClerkAuthUser => {
    const request = ctx.switchToHttp().getRequest();
    
    if (!request.auth || !request.auth.userId) {
      throw new UnauthorizedException('User is not authenticated');
    }
    
    return {
      id: request.auth.userId,
      email: request.auth.email || '',
      notionConnected: !!request.auth.notionAccessToken,
    };
  },
); 