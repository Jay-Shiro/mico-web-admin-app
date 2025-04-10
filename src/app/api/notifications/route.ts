import { NextRequest, NextResponse } from "next/server";
import { Notification } from "@/types/notification";

const STORAGE_KEY = "admin_notifications";

// GET: Retrieve all notifications
export async function GET() {
  try {
    // In a real app, this would fetch from a database
    // For now, we'll get from localStorage on server component
    return NextResponse.json({
      status: "success",
      notifications: [],
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

// POST: Create a new notification
export async function POST(req: NextRequest) {
  try {
    const notification = await req.json();

    if (!notification.type || !notification.title || !notification.message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const newNotification: Notification = {
      ...notification,
      id: `not-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      read: false,
    };

    return NextResponse.json({
      status: "success",
      notification: newNotification,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create notification" },
      { status: 500 }
    );
  }
}
