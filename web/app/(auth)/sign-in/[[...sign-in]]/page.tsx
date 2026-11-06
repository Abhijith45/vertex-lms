import React, { Suspense } from "react";
import { AuthCardLayout } from "@/components/auth/auth-card-layout";
import { CustomSignInForm } from "@/components/auth/custom-sign-in-form";

export const metadata = {
  title: "Sign In | Vertex",
  description: "Sign in to your Vertex account to continue learning.",
};

function AuthFormFallback() {
  return (
    <div className="space-y-4 animate-pulse py-2">
      <div className="h-12 rounded-xl bg-neutral-200/60 dark:bg-neutral-800/60 w-full" />
      <div className="h-12 rounded-xl bg-neutral-200/60 dark:bg-neutral-800/60 w-full" />
      <div className="h-12 rounded-xl bg-neutral-200/60 dark:bg-neutral-800/60 w-full" />
    </div>
  );
}

export default function SignInPage() {
  return (
    <AuthCardLayout
      title="Welcome back"
      subtitle="Sign in to your account to continue your learning journey."
      activePath="/sign-in"
    >
      <Suspense fallback={<AuthFormFallback />}>
        <CustomSignInForm />
      </Suspense>
    </AuthCardLayout>
  );
}
