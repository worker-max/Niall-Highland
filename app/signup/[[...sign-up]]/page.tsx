import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream-50 p-6">
      <SignUp
        appearance={{
          elements: {
            rootBox: "w-full max-w-md",
            card: "shadow-card border border-ink-200",
          },
        }}
      />
    </div>
  );
}
