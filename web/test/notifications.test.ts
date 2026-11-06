import { describe, it, beforeEach } from "node:test";
import assert from "node:assert";
import {
  getNotificationsForUser,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  createNotification,
  formatRelativeTime,
  resetNotificationsForTesting,
} from "../lib/notifications.ts";

describe("Notifications Module Data Layer", () => {
  const userId = "user_test_learner_42";

  beforeEach(() => {
    resetNotificationsForTesting();
  });

  it("seeds initial notifications on first user query", () => {
    const list = getNotificationsForUser(userId);
    assert.strictEqual(list.length, 4);
    assert.strictEqual(list[0].type, "streak");
    assert.strictEqual(list[1].type, "discussion");
    assert.strictEqual(list[2].type, "course_update");
    assert.strictEqual(list[3].type, "certificate");
  });

  it("correctly counts unread notifications", () => {
    // 3 out of 4 seed notifications are unread initially
    const count = getUnreadNotificationCount(userId);
    assert.strictEqual(count, 3);
  });

  it("marks a single notification as read", () => {
    const list = getNotificationsForUser(userId);
    const targetId = list[0].id;
    assert.strictEqual(list[0].read, false);

    const success = markNotificationAsRead(userId, targetId);
    assert.strictEqual(success, true);

    const updated = getNotificationsForUser(userId);
    assert.strictEqual(updated[0].read, true);
    assert.strictEqual(getUnreadNotificationCount(userId), 2);
  });

  it("returns false when marking a non-existent notification", () => {
    const success = markNotificationAsRead(userId, "non-existent-id-999");
    assert.strictEqual(success, false);
  });

  it("marks all notifications as read at once", () => {
    const success = markAllNotificationsAsRead(userId);
    assert.strictEqual(success, true);

    const list = getNotificationsForUser(userId);
    assert.ok(list.every((n) => n.read === true));
    assert.strictEqual(getUnreadNotificationCount(userId), 0);
  });

  it("creates and prepends a new notification", () => {
    const created = createNotification({
      userId,
      type: "system",
      title: "System Maintenance Completed",
      message: "The search indexing engine was upgraded.",
      href: "/courses",
    });

    assert.ok(created.id.startsWith("notif-"));
    assert.strictEqual(created.read, false);
    assert.strictEqual(created.title, "System Maintenance Completed");

    const list = getNotificationsForUser(userId);
    assert.strictEqual(list.length, 5);
    assert.strictEqual(list[0].id, created.id);
    assert.strictEqual(getUnreadNotificationCount(userId), 4);
  });

  it("isolates notifications between different users", () => {
    const userA = "user_alice";
    const userB = "user_bob";

    markAllNotificationsAsRead(userA);
    assert.strictEqual(getUnreadNotificationCount(userA), 0);
    assert.strictEqual(getUnreadNotificationCount(userB), 3);
  });
});

describe("Relative Time Formatting", () => {
  const referenceNow = new Date("2026-11-06T12:00:00.000Z");

  it("formats seconds as 'Just now'", () => {
    const past = new Date(referenceNow.getTime() - 25 * 1000).toISOString();
    assert.strictEqual(formatRelativeTime(past, referenceNow), "Just now");
  });

  it("formats minutes as 'Xm ago'", () => {
    const past = new Date(referenceNow.getTime() - 15 * 60 * 1000).toISOString();
    assert.strictEqual(formatRelativeTime(past, referenceNow), "15m ago");
  });

  it("formats hours as 'Xh ago'", () => {
    const past = new Date(referenceNow.getTime() - 4 * 60 * 60 * 1000).toISOString();
    assert.strictEqual(formatRelativeTime(past, referenceNow), "4h ago");
  });

  it("formats 24-48 hours as 'Yesterday'", () => {
    const past = new Date(referenceNow.getTime() - 26 * 60 * 60 * 1000).toISOString();
    assert.strictEqual(formatRelativeTime(past, referenceNow), "Yesterday");
  });

  it("formats 2-6 days as 'Xd ago'", () => {
    const past = new Date(referenceNow.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString();
    assert.strictEqual(formatRelativeTime(past, referenceNow), "3d ago");
  });

  it("formats 7+ days as localized short date", () => {
    const past = new Date(referenceNow.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString();
    const formatted = formatRelativeTime(past, referenceNow);
    assert.match(formatted, /^[A-Z][a-z]{2}\s\d{1,2}$/);
  });
});
