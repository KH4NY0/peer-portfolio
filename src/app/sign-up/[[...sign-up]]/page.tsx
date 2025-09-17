import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="container-app py-8">
      <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" />
    </div>
  );
}
