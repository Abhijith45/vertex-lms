import React from "react";
import Image from "next/image";

export function UserAvatar() {
  return (
    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full ring-2 ring-neutral-200/60 hover:ring-primary-400 transition-all select-none">
      <Image
        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop"
        alt="User profile"
        width={40}
        height={40}
        className="h-full w-full object-cover object-center"
        priority
        unoptimized
      />
    </div>
  );
}
