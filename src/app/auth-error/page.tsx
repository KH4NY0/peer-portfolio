import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function AuthErrorPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const error = searchParams.error;
  const errorMessage = Array.isArray(error) ? error[0] : error;
  
  let errorDetails = "An unexpected error occurred during authentication.";
  
  if (errorMessage) {
    switch (errorMessage) {
      case 'configuration':
        errorDetails = "There was a problem with the authentication configuration.";
        break;
      case 'accessdenied':
        errorDetails = "You don't have permission to access this page.";
        break;
      case 'verification':
        errorDetails = "The verification link is invalid or has expired. Please try again.";
        break;
      case 'sessionrequired':
        errorDetails = "Please sign in to access this page.";
        break;
      default:
        errorDetails = `Authentication error: ${errorMessage}`;
    }
  }

  return (
    <div className="container-app py-16">
      <div className="mx-auto max-w-md space-y-8 text-center">
        <div className="flex justify-center">
          <div className="rounded-full bg-destructive/10 p-3">
            <AlertTriangle className="h-10 w-10 text-destructive" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Authentication Error</h1>
          <p className="text-muted-foreground">{errorDetails}</p>
        </div>

        <div className="flex flex-col gap-4 pt-4">
          <Link href="/sign-in" className="btn btn-primary w-full">
            Return to Sign In
          </Link>
          <Link 
            href="/" 
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Go back home →
          </Link>
        </div>
      </div>
    </div>
  );
}

export const dynamic = 'force-static';
