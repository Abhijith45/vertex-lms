"use client";

import React, { useState } from "react";
import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

interface SignOutButtonProps {
  redirectUrl?: string;
  className?: string;
  children?: React.ReactNode;
}

export function CustomSignOutButton({
  redirectUrl = "/",
  className = "",
  children,
}: SignOutButtonProps) {
  const { signOut } = useClerk();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      await signOut({ redirectUrl });
      router.push(redirectUrl);
    } catch (err) {
      console.error("Sign out error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={isLoading}
      className={
        className ||
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer disabled:opacity-50"
      }
    >
      {isLoading ? (
        <div className="h-3.5 w-3.5 border-2 border-neutral-400 border-t-red-500 rounded-full animate-spin" />
      ) : (
        <LogOut className="h-3.5 w-3.5" />
      )}
      <span>{children || "Sign out"}</span>
    </button>
  );
}
