import React from "react";
import { AuthCardLayout } from "@/components/auth/auth-card-layout";
import { CustomSignInForm } from "@/components/auth/custom-sign-in-form";

export const metadata = {
  title: "Sign In | Vertex",
  description: "Sign in to your Vertex account to continue learning.",
};

export default function SignInPage() {
  return (
    <AuthCardLayout
      title="Welcome back"
      subtitle="Sign in to your account to continue your learning journey."
      activePath="/sign-in"
    >
      <CustomSignInForm />
    </AuthCardLayout>
  );
}
