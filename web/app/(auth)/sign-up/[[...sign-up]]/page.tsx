import React from "react";
import { AuthCardLayout } from "@/components/auth/auth-card-layout";
import { CustomSignUpForm } from "@/components/auth/custom-sign-up-form";

export const metadata = {
  title: "Create Account | Vertex",
  description: "Join Vertex to track course progress, access bookmarks, and learn faster.",
};

export default function SignUpPage() {
  return (
    <AuthCardLayout
      title="Create your account"
      subtitle="Join thousands of engineers learning with interactive video intelligence."
      activePath="/sign-up"
    >
      <CustomSignUpForm />
    </AuthCardLayout>
  );
}
