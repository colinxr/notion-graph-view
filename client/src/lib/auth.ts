import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import { ApiErrorResponse } from '@/types/api';

/**
 * Get the current user session
 */
export function getCurrentUser() {
  const { userId } = auth();
  
  if (!userId) {
    return null;
  }
  
  return { userId };
}

/**
 * Middleware to check if user is authenticated in API routes
 */
export function requireAuth() {
  const { userId } = auth();
  
  if (!userId) {
    return new NextResponse(
      JSON.stringify({
        message: 'Unauthorized. Please sign in.',
        status: 401,
      } as ApiErrorResponse),
      { status: 401 }
    );
  }
  
  return null;
}

/**
 * Get user ID from session (for API routes)
 */
export function getUserId(): string | null {
  const { userId } = auth();
  return userId;
} 