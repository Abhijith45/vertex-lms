import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import {
  getNotificationsForUser,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "@/lib/notifications";

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const notifications = getNotificationsForUser(user.id);
    const unreadCount = getUnreadNotificationCount(user.id);

    return NextResponse.json({
      notifications,
      unreadCount,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { id, all } = body;

    if (all) {
      markAllNotificationsAsRead(user.id);
    } else if (id && typeof id === "string") {
      markNotificationAsRead(user.id, id);
    } else {
      return NextResponse.json(
        { error: "Missing required parameter 'id' or 'all'" },
        { status: 400 }
      );
    }

    const unreadCount = getUnreadNotificationCount(user.id);

    return NextResponse.json({
      success: true,
      unreadCount,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
