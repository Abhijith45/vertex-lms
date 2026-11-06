import React, { Suspense } from "react";
import { AuthCardLayout } from "@/components/auth/auth-card-layout";
import { CustomSignUpForm } from "@/components/auth/custom-sign-up-form";

export const metadata = {
  title: "Create Account | Vertex",
  description: "Join Vertex to track course progress, access bookmarks, and learn faster.",
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

export default function SignUpPage() {
  return (
    <AuthCardLayout
      title="Create your account"
      subtitle="Join thousands of engineers learning with interactive video intelligence."
      activePath="/sign-up"
    >
      <Suspense fallback={<AuthFormFallback />}>
        <CustomSignUpForm />
      </Suspense>
    </AuthCardLayout>
  );
}
