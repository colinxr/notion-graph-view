// Clerk User extended with Notion specific data
export interface ClerkUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  emailAddress: string | null;
  imageUrl: string;
  notionUserId?: string;
  notionWorkspaces?: NotionWorkspace[];
}

// Notion Workspace data stored in Clerk user metadata
export interface NotionWorkspace {
  id: string;
  name: string;
  avatar?: string;
  notionAccessToken?: string;
  isConnected: boolean;
}

// Notion OAuth response after successful sign-in
export interface NotionOAuthResponse {
  access_token: string;
  bot_id: string;
  duplicated_template_id?: string;
  owner?: {
    user: {
      id: string;
      name: string;
      avatar_url: string;
      type: 'person';
      object: 'user';
    };
  };
  workspace_id: string;
  workspace_name: string;
  workspace_icon: string | null;
} 