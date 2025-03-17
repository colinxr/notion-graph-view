import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClerkClient } from '@clerk/backend';
import { 
  ClerkSessionContext, 
  ClerkAuthUser 
} from '../../../iam/application/dtos/clerk-session.dto';

@Injectable()
export class ClerkService {
  private readonly logger = new Logger(ClerkService.name);
  private readonly clerk;

  constructor(
    private readonly configService: ConfigService,
  ) {
    // Initialize Clerk client
    this.clerk = createClerkClient({
      secretKey: this.configService.get<string>('CLERK_SECRET_KEY'),
      publishableKey: this.configService.get<string>('CLERK_PUBLISHABLE_KEY'),
    });
  }

  /**
   * Validates a request and extracts session information
   * @param request The Express request object
   * @returns The validated session context containing user and Notion information
   */
  async validateRequest(request: any): Promise<ClerkSessionContext> {
    try {
      this.logger.debug('Validating Clerk authentication');
      
      // Authenticate the request using Clerk
      const requestState = await this.clerk.authenticateRequest(request, {
        // Optional: provide JWT key for networkless authentication
        // jwtKey: this.configService.get<string>('CLERK_JWT_KEY'),
        authorizedParties: [this.configService.get<string>('APP_URL', 'http://localhost:3000')],
      });
      
      if (!requestState.isSignedIn) {
        this.logger.warn('Invalid or missing authentication');
        throw new UnauthorizedException('Not authenticated');
      }

      // Convert to auth object to access userId
      const auth = requestState.toAuth();
      
      if (!auth.userId) {
        this.logger.warn('No user ID found in authentication');
        throw new UnauthorizedException('User ID not found');
      }

      // Get the user
      const user = await this.clerk.users.getUser(auth.userId);
      
      if (!user) {
        this.logger.warn(`User not found: ${auth.userId}`);
        throw new UnauthorizedException('User not found');
      }

      // Get the Notion access token from user's metadata
      const notionAccessToken = (user.publicMetadata?.notionAccessToken as string) || '';
      
      return {
        userId: user.id,
        sessionId: auth.sessionId || '',
        notionAccessToken,
      };
    } catch (error) {
      this.logger.error(`Authentication failed: ${error.message}`, error.stack);
      throw new UnauthorizedException('Authentication failed');
    }
  }

  /**
   * Retrieves user information from Clerk
   * @param userId The Clerk user ID
   * @returns The user information
   */
  async getUserInfo(userId: string): Promise<ClerkAuthUser> {
    try {
      const user = await this.clerk.users.getUser(userId);
      
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Get primary email
      const primaryEmail = user.emailAddresses.find((email: any) => 
        email.id === user.primaryEmailAddressId
      )?.emailAddress;

      // Check if user has Notion connected
      const hasNotionConnected = !!user.publicMetadata?.notionAccessToken;

      return {
        id: user.id,
        email: primaryEmail || '',
        notionConnected: hasNotionConnected,
      };
    } catch (error) {
      this.logger.error(`Error retrieving user info: ${error.message}`, error.stack);
      throw new UnauthorizedException('Failed to retrieve user information');
    }
  }

  /**
   * Updates the Notion access token for a user
   * @param userId The Clerk user ID
   * @param notionAccessToken The Notion access token
   */
  async updateNotionAccessToken(userId: string, notionAccessToken: string): Promise<void> {
    try {
      await this.clerk.users.updateUser(userId, {
        publicMetadata: {
          notionAccessToken,
        },
      });
      
      this.logger.debug(`Updated Notion access token for user: ${userId}`);
    } catch (error) {
      this.logger.error(`Error updating Notion access token: ${error.message}`, error.stack);
      throw new Error('Failed to update Notion access token');
    }
  }
} 