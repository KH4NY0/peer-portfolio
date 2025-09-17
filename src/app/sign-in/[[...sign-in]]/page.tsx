import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="container-app py-8">
      <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" />
    </div>
  );
}
