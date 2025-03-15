import { Button } from "@/components/ui/button";
import { SiNotion } from "react-icons/si";
import { useSignIn } from "@clerk/nextjs";
import { useState } from "react";

interface OAuthButtonProps {
  provider: "notion";
}

export function OAuthButton({ provider }: OAuthButtonProps) {
  const { signIn, isLoaded } = useSignIn();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    if (!isLoaded) return;
    
    try {
      setIsLoading(true);
      await signIn.authenticateWithRedirect({
        strategy: "oauth_notion",
        redirectUrl: "/login/notion-callback",
        redirectUrlComplete: "/dashboard",
      });
    } catch (error) {
      console.error("OAuth error:", error);
      setIsLoading(false);
    }
  };

  return (
    <Button
      className="w-full flex items-center justify-center gap-2"
      variant="outline"
      onClick={handleSignIn}
      disabled={isLoading || !isLoaded}
    >
      <SiNotion className="h-5 w-5" />
      <span>{isLoading ? "Connecting..." : "Continue with Notion"}</span>
    </Button>
  );
} 