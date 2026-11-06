export type NotificationType =
  | "streak"
  | "course_update"
  | "discussion"
  | "certificate"
  | "system";

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  href: string;
  read: boolean;
  createdAt: string;
}

// In-memory notifications store keyed by userId
const USER_NOTIFICATIONS_STORE = new Map<string, Notification[]>();

/**
 * Generate contextual seed notifications for a learner.
 */
function generateSeedNotifications(userId: string): Notification[] {
  const now = Date.now();
  return [
    {
      id: `notif-${userId}-1`,
      userId,
      type: "streak",
      title: "Daily Streak Active! 🔥",
      message: "You're on a 3-day learning streak. Complete today's lesson to keep the fire going!",
      href: "/my-learning",
      read: false,
      createdAt: new Date(now - 1000 * 60 * 15).toISOString(), // 15 mins ago
    },
    {
      id: `notif-${userId}-2`,
      type: "discussion",
      userId,
      title: "New reply on your question",
      message: "Instructor Marcus replied to your question in 'Building AI Apps with LLMs'.",
      href: "/lessons/building-ai-apps-with-llms",
      read: false,
      createdAt: new Date(now - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    },
    {
      id: `notif-${userId}-3`,
      type: "course_update",
      userId,
      title: "New Module Available",
      message: "Module 4: 'Kubernetes Cluster Orchestration' is now unlocked in your curriculum.",
      href: "/courses/devops-with-docker-and-kubernetes",
      read: false,
      createdAt: new Date(now - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    },
    {
      id: `notif-${userId}-4`,
      type: "certificate",
      userId,
      title: "Certificate Ready to Claim! 🎓",
      message: "You have completed 100% of 'Next.js App Router in Depth'. Claim your verified credential.",
      href: "/my-learning",
      read: true,
      createdAt: new Date(now - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    },
  ];
}

/**
 * Retrieve all notifications for a given user.
 */
export function getNotificationsForUser(userId: string): Notification[] {
  if (!USER_NOTIFICATIONS_STORE.has(userId)) {
    USER_NOTIFICATIONS_STORE.set(userId, generateSeedNotifications(userId));
  }
  const list = USER_NOTIFICATIONS_STORE.get(userId) || [];
  return [...list].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/**
 * Get count of unread notifications for a user.
 */
export function getUnreadNotificationCount(userId: string): number {
  const notifications = getNotificationsForUser(userId);
  return notifications.filter((n) => !n.read).length;
}

/**
 * Mark a single notification as read.
 */
export function markNotificationAsRead(userId: string, notificationId: string): boolean {
  const notifications = getNotificationsForUser(userId);
  const target = notifications.find((n) => n.id === notificationId);
  if (!target) return false;
  target.read = true;
  USER_NOTIFICATIONS_STORE.set(userId, notifications);
  return true;
}

/**
 * Mark all notifications for a user as read.
 */
export function markAllNotificationsAsRead(userId: string): boolean {
  const notifications = getNotificationsForUser(userId);
  for (const n of notifications) {
    n.read = true;
  }
  USER_NOTIFICATIONS_STORE.set(userId, notifications);
  return true;
}

/**
 * Create a new notification for a user.
 */
export function createNotification(
  params: Omit<Notification, "id" | "createdAt" | "read">
): Notification {
  const notif: Notification = {
    ...params,
    id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    read: false,
    createdAt: new Date().toISOString(),
  };

  const list = getNotificationsForUser(params.userId);
  list.unshift(notif);
  USER_NOTIFICATIONS_STORE.set(params.userId, list);
  return notif;
}

/**
 * Format timestamp into concise, readable relative time.
 */
export function formatRelativeTime(dateString: string, now: Date = new Date()): string {
  const timestamp = new Date(dateString).getTime();
  const diffMs = now.getTime() - timestamp;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSec < 60) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/**
 * Reset notification store for isolated unit tests.
 */
export function resetNotificationsForTesting(): void {
  USER_NOTIFICATIONS_STORE.clear();
}
