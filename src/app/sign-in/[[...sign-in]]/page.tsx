import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { Suspense } from "react";

function SignInLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-12 h-12 border-4 border-t-accent border-l-accent border-r-transparent border-b-transparent rounded-full animate-spin"></div>
      <p className="text-muted-foreground">Loading sign-in...</p>
    </div>
  );
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // Extract redirect_url safely
  const redirectUrl = (() => {
    const url = searchParams.redirect_url;
    return Array.isArray(url) ? url[0] : url;
  })();

  return (
    <div className="container-app py-8">
      <div className="mx-auto max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Welcome back</h1>
          <p className="text-muted-foreground">
            Sign in to your account to continue
          </p>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <Suspense fallback={<SignInLoading />}>
            <SignIn
              routing="path"
              path="/sign-in"
              signUpUrl="/sign-up"
              redirectUrl={redirectUrl || "/dashboard"}
              appearance={{
                elements: {
                  rootBox: 'w-full',
                  card: 'shadow-none w-full',
                  headerTitle: 'text-xl font-semibold',
                  headerSubtitle: 'text-muted-foreground',
                  formFieldLabel: 'text-foreground',
                  formFieldInput: 'bg-background border-border',
                  formFieldInputShowPasswordButton: 'text-muted-foreground hover:text-foreground',
                  formFieldInputShowPasswordIcon: 'text-current',
                  formFieldAction: 'text-muted-foreground hover:text-foreground',
                  formButtonPrimary: 'btn-primary w-full',
                  footerActionLink: 'text-accent hover:underline',
                  socialButtonsBlockButton: 'border-border hover:bg-accent/10',
                  socialButtonsBlockButtonText: 'text-foreground',
                  dividerLine: 'bg-border',
                  dividerText: 'text-muted-foreground',
                  formHeaderTitle: 'text-xl font-semibold',
                  formHeaderSubtitle: 'text-muted-foreground',
                },
                variables: {
                  colorPrimary: 'hsl(263.4, 70%, 50.4%)',
                },
              }}
            />
          </Suspense>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          <p>
            Don&apos;t have an account?{" "}
            <Link
              href="/sign-up"
              className="font-medium text-accent hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
