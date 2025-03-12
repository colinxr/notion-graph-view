import { Module } from '@nestjs/common';

/**
 * Mock IAM Module for testing
 * This is a simplified version of the IAM module for testing purposes
 */
@Module({
  providers: [
    {
      provide: 'IUserService',
      useValue: {
        findById: async (id: string) => {
          return { id, name: `User ${id}`, email: `user${id}@example.com` };
        },
        findByIds: async (ids: string[]) => {
          return ids.map(id => ({ id, name: `User ${id}`, email: `user${id}@example.com` }));
        },
      },
    },
  ],
  exports: ['IUserService'],
})
export class mockIamModule {} 