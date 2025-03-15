#!/bin/bash

# Install Clerk dependencies
npm install @clerk/nextjs @clerk/themes react-icons

# Create .env.local file with placeholders for Clerk keys
cat > .env.local << EOL
# Clerk authentication keys
# Get these from https://dashboard.clerk.com
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_replace_with_your_publishable_key
CLERK_SECRET_KEY=sk_test_replace_with_your_secret_key

# Clerk OAuth callback URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/login
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
EOL

echo "Clerk dependencies installed."
echo "IMPORTANT: You need to configure your Clerk application:"
echo "1. Sign up at https://clerk.com"
echo "2. Create a new application"
echo "3. In Clerk dashboard, go to 'Social Connections' and add Notion OAuth"
echo "4. Configure your .env.local file with the correct keys"
echo "5. Add https://your-domain.com/sign-in/notion-callback as a callback URL in Clerk dashboard" 