import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import { ReactNode } from 'react';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: '#635fc7', // Match with project primary color
        },
        elements: {
          formButtonPrimary:
            'bg-primary hover:bg-primary/90 text-white rounded-md px-4 py-2',
          card: 'bg-background border-gray-200 shadow-md',
          footerActionLink: 'text-primary hover:text-primary/90',
          identityPreview: 'bg-background border-gray-200',
        },
      }}
    >
      {children}
    </ClerkProvider>
  );
} 