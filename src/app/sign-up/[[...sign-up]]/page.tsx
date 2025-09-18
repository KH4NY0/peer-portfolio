import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { Suspense } from "react";

function SignUpLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-12 h-12 border-4 border-t-accent border-l-accent border-r-transparent border-b-transparent rounded-full animate-spin"></div>
      <p className="text-muted-foreground">Loading sign-up...</p>
    </div>
  );
}

export default function SignUpPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // Extract redirect_url safely
  const redirectUrl = (() => {
    if (typeof window === 'undefined') return undefined;
    const params = new URLSearchParams(window.location.search);
    const url = params.get('redirect_url');
    return url || undefined;
  })();

  return (
    <div className="container-app py-8">
      <div className="mx-auto max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Create an account</h1>
          <p className="text-muted-foreground">
            Get started with your free account today
          </p>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <Suspense fallback={<SignUpLoading />}>
            <SignUp
              routing="path"
              path="/sign-up"
              signInUrl="/sign-in"
              redirectUrl={redirectUrl || "/onboarding"}
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
                  formFieldErrorText: 'text-destructive',
                  formFieldWarningText: 'text-yellow-500',
                  formFieldSuccessText: 'text-green-500',
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
            Already have an account?{" "}
            <Link
              href="/sign-in"
              className="font-medium text-accent hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
