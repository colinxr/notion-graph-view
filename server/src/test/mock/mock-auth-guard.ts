import { ExecutionContext } from '@nestjs/common';

/**
 * Mock Auth Guard for testing
 * This simulates authentication with a specified user ID
 */
export const mockAuthGuard = (userId: string) => {
  return {
    canActivate: (context: ExecutionContext) => {
      // Add the user to the request
      const request = context.switchToHttp().getRequest();
      request.user = { id: userId };
      return true;
    }
  };
}; 