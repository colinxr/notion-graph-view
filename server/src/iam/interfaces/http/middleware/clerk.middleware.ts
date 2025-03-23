import { Injectable, NestMiddleware, UnauthorizedException, Logger } from '@nestjs/common';
import { getAuth, clerkClient, clerkMiddleware } from '@clerk/express';
import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';

// Define extended request interface with auth property
interface RequestWithAuth extends Request {
  auth: {
    userId: string;
    notionAccessToken: string;
    sessionId: string;
  };
}

// Define structure for session claims
interface SessionClaims {
  publicMetadata?: {
    notionAccessToken?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

@Injectable()
export class ClerkMiddleware implements NestMiddleware {
  private readonly logger = new Logger(ClerkMiddleware.name);
  private readonly clerk;

  constructor(private readonly configService: ConfigService) {
    // Initialize Clerk middleware
    this.clerk = clerkMiddleware({
      secretKey: this.configService.get<string>('CLERK_SECRET_KEY'),
      publishableKey: this.configService.get<string>('CLERK_PUBLISHABLE_KEY')
    });
  }

  use(req: Request, res: Response, next: NextFunction) {
    // First apply Clerk's Express middleware
    this.clerk(req, res, (err: any) => {
      if (err) {
        this.logger.error(`Clerk middleware error: ${err.message}`, err.stack);
        return next(new UnauthorizedException('Authentication error'));
      }
      
      try {
        this.logger.debug('Validating Clerk authentication');
        
        // Now getAuth can be used safely
        const auth = getAuth(req);

        // If user isn't authenticated, throw an UnauthorizedException
        if (!auth.userId) {
          this.logger.warn('No user ID found in authentication');
          throw new UnauthorizedException('User not authenticated');
        }

        // Get Notion token from session claims if available
        const sessionClaims = auth.sessionClaims as SessionClaims;
        const notionAccessToken = sessionClaims?.publicMetadata?.notionAccessToken || '';

        // Attach the authenticated user's data to the request object for controllers to use
        (req as RequestWithAuth).auth = {
          userId: auth.userId,
          sessionId: auth.sessionId || '',
          notionAccessToken,
        };

        next();
      } catch (error) {
        this.logger.error(`Clerk authentication error: ${error.message}`, error.stack);
        next(new UnauthorizedException('Authentication failed'));
      }
    });
  }
} 