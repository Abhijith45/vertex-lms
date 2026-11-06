import React from "react";
import { Mail, LucideIcon } from "lucide-react";

export interface PolicyContactCardProps {
  name?: string;
  role?: string;
  email?: string;
  note?: React.ReactNode;
}

export function PolicyContactCard({
  name = "Abhijeet Rawat",
  role,
  email = "abhijeetrawat45@gmail.com",
  note,
}: PolicyContactCardProps) {
  return (
    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 bg-neutral-50 dark:bg-neutral-900/60 max-w-md">
      {role && (
        <p className="text-xs uppercase tracking-wider text-neutral-500 font-semibold mb-1">
          {role}
        </p>
      )}
      <p className="font-bold text-neutral-900 dark:text-white text-base">{name}</p>
      <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
        Email:{" "}
        <a
          href={`mailto:${email}`}
          className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
        >
          {email}
        </a>
      </p>
      {note && (
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
          {note}
        </p>
      )}
    </div>
  );
}

export interface PolicyContactSectionProps extends PolicyContactCardProps {
  sectionTitle: string;
  description: string;
  icon?: LucideIcon;
}

export function PolicyContactSection({
  sectionTitle,
  description,
  icon: Icon = Mail,
  name,
  role,
  email,
  note,
}: PolicyContactSectionProps) {
  return (
    <section className="space-y-3">
      <h2 className="font-display text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2.5">
        <Icon className="h-5 w-5 text-primary-500" />
        <span>{sectionTitle}</span>
      </h2>
      <p>{description}</p>
      <PolicyContactCard name={name} role={role} email={email} note={note} />
    </section>
  );
}
