"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCheck,
  Flame,
  MessageSquare,
  BookOpen,
  Award,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { type Notification, formatRelativeTime } from "@/lib/notifications";

export function NotificationPopover() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [isLoading, setIsLoading] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Close on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Mark single notification as read
  const handleMarkAsRead = async (id: string) => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  // Mark all notifications as read
  const handleMarkAllAsRead = async () => {
    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);

    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
    }
  };

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "streak":
        return (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-[#EA580C] dark:bg-orange-950/60 dark:text-orange-400">
            <Flame className="h-4 w-4" />
          </div>
        );
      case "discussion":
        return (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
            <MessageSquare className="h-4 w-4" />
          </div>
        );
      case "course_update":
        return (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
            <BookOpen className="h-4 w-4" />
          </div>
        );
      case "certificate":
        return (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
            <Award className="h-4 w-4" />
          </div>
        );
      default:
        return (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
            <Sparkles className="h-4 w-4" />
          </div>
        );
    }
  };

  const displayedNotifications =
    filter === "unread"
      ? notifications.filter((n) => !n.read)
      : notifications;

  return (
    <div className="relative" ref={popoverRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => {
          const next = !isOpen;
          setIsOpen(next);
          if (next) fetchNotifications();
        }}
        className={`relative flex h-9 w-9 items-center justify-center rounded-full transition-colors cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary-400 ${
          isOpen
            ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white"
            : "text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white"
        }`}
        aria-label="View notifications"
        aria-expanded={isOpen}
      >
        <Bell className="h-4.5 w-4.5" strokeWidth={1.75} />

        {/* Unread Badge Count */}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-[#E05A36] text-[10px] font-bold text-white shadow-xs">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Floating Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-80 sm:w-96 rounded-2xl bg-white dark:bg-[#0F172A] border border-neutral-200/90 dark:border-neutral-800 shadow-2xl ring-1 ring-black/5 dark:ring-white/5 backdrop-blur-xl z-50 overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-neutral-200/80 dark:border-neutral-800/80 px-4 py-3 bg-neutral-50/60 dark:bg-neutral-900/60">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-neutral-900 dark:text-white">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="rounded-full bg-orange-100 dark:bg-orange-950/60 px-2 py-0.5 text-[11px] font-semibold text-[#EA580C] dark:text-orange-400">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                className="inline-flex items-center gap-1 text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors cursor-pointer"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex border-b border-neutral-200/60 dark:border-neutral-800/60 px-3 pt-2 bg-neutral-50/30 dark:bg-neutral-900/30 gap-2">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`pb-2 px-2 text-xs font-medium transition-colors cursor-pointer border-b-2 -mb-[1px] ${
                filter === "all"
                  ? "border-[#E05A36] text-[#E05A36] font-semibold"
                  : "border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter("unread")}
              className={`pb-2 px-2 text-xs font-medium transition-colors cursor-pointer border-b-2 -mb-[1px] ${
                filter === "unread"
                  ? "border-[#E05A36] text-[#E05A36] font-semibold"
                  : "border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800/60">
            {isLoading && notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-neutral-400">
                Loading notifications...
              </div>
            ) : displayedNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                <CheckCircle2 className="h-9 w-9 text-neutral-300 dark:text-neutral-600 mb-2" />
                <p className="text-xs font-medium text-neutral-800 dark:text-neutral-200">
                  You&apos;re all caught up!
                </p>
                <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-0.5">
                  {filter === "unread"
                    ? "No unread notifications at the moment."
                    : "No notifications to show."}
                </p>
              </div>
            ) : (
              displayedNotifications.map((notif) => (
                <Link
                  key={notif.id}
                  href={notif.href}
                  onClick={() => {
                    handleMarkAsRead(notif.id);
                    setIsOpen(false);
                  }}
                  className={`flex items-start gap-3 p-3.5 transition-colors group cursor-pointer ${
                    notif.read
                      ? "hover:bg-neutral-50 dark:hover:bg-neutral-800/50 opacity-80 hover:opacity-100"
                      : "bg-[#FFF9F6]/80 dark:bg-orange-950/20 hover:bg-[#FFF4EE] dark:hover:bg-orange-950/30"
                  }`}
                >
                  {getNotificationIcon(notif.type)}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <p
                        className={`text-xs truncate ${
                          notif.read
                            ? "font-medium text-neutral-800 dark:text-neutral-200"
                            : "font-semibold text-neutral-900 dark:text-white"
                        }`}
                      >
                        {notif.title}
                      </p>
                      <span className="shrink-0 text-[10px] text-neutral-400 dark:text-neutral-500">
                        {formatRelativeTime(notif.createdAt)}
                      </span>
                    </div>

                    <p className="text-[11.5px] leading-relaxed text-neutral-600 dark:text-neutral-300 line-clamp-2">
                      {notif.message}
                    </p>
                  </div>

                  {!notif.read && (
                    <span
                      className="h-2 w-2 rounded-full bg-[#E05A36] shrink-0 mt-1.5"
                      aria-label="Unread"
                    />
                  )}
                </Link>
              ))
            )}
          </div>

          {/* Footer View All Link */}
          <div className="border-t border-neutral-200/70 dark:border-neutral-800/70 p-2.5 text-center bg-neutral-50/40 dark:bg-neutral-900/40">
            <Link
              href="/my-learning"
              onClick={() => setIsOpen(false)}
              className="text-xs font-semibold text-[#E05A36] hover:text-[#C2410C] dark:hover:text-orange-400 transition-colors"
            >
              Go to My Learning dashboard →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
