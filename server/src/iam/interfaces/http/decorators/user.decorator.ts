import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserDto } from '../../../application/dtos/user.dto';

/**
 * Parameter decorator that extracts the authenticated user from the request.
 * 
 * Usage:
 * ```typescript
 * @Get()
 * getItem(@User() user: UserDto) {
 *   // user contains the authenticated user information
 * }
 * ```
 */
export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserDto => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
); 