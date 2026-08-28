import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { GoogleIcon } from "@/components/icons/brand-icons";

export function GoogleSignInButton({ className }: { className?: string }) {
  return (
    <Button
      variant="outline"
      className={cn("w-full", className)}
      render={<a href="/api/auth/google/start" />}
      nativeButton={false}
    >
      <GoogleIcon className="h-4 w-4" /> Continue with Google
    </Button>
  );
}
