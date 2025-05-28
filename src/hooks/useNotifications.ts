import { useState, useEffect, useCallback } from "react";
import {
  Notification,
  NotificationType,
  UserRole,
  ROLE_NOTIFICATIONS,
} from "@/types/notification";

const STORAGE_KEY = "admin_notifications";
const HISTORY_KEY = "notifications_history"; // New key for tracking all notifications
const MONITORING_INTERVAL = 160000; // 1 minute

interface DeliveryData {
  _id: string;
  status: string;
  payment_status: string;
}

interface RiderData {
  _id: string;
  status: string;
}

interface Stats {
  ridersCount: number;
  deliveriesCount: number;
  deliveryStatuses: Map<string, string>;
  riderStatuses: Map<string, string>;
  paymentStatuses: Map<string, string>;
}

interface NotificationHistory {
  type: NotificationType;
  entityId?: string;
  timestamp: number;
}

export const useNotifications = (userRole: UserRole) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [prevStats, setPrevStats] = useState<Stats>({
    ridersCount: 0,
    deliveriesCount: 0,
    deliveryStatuses: new Map(),
    riderStatuses: new Map(),
    paymentStatuses: new Map(),
  });

  // Load notifications from localStorage
  useEffect(() => {
    const loadNotifications = () => {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const allNotifications = JSON.parse(stored) as Notification[];
        // Filter notifications based on user role
        const filtered = allNotifications.filter((n) =>
          n.forRoles.includes(userRole)
        );
        setNotifications(filtered);
        const unread = filtered.filter((n) => !n.read).length;
        setUnreadCount(unread);

        // Dispatch custom event for real-time updates
        window.dispatchEvent(
          new CustomEvent("notificationCountUpdate", {
            detail: { count: unread },
          })
        );
      }
    };

    loadNotifications();
    window.addEventListener("storage", loadNotifications);
    window.addEventListener("notificationUpdate", loadNotifications);

    return () => {
      window.removeEventListener("storage", loadNotifications);
      window.removeEventListener("notificationUpdate", loadNotifications);
    };
  }, [userRole]);

  // Load and save notification history
  const checkNotificationHistory = (
    type: NotificationType,
    entityId?: string
  ): boolean => {
    const history = JSON.parse(
      localStorage.getItem(HISTORY_KEY) || "[]"
    ) as NotificationHistory[];
    const now = Date.now();

    // Clean up old history entries (older than 24 hours)
    const updatedHistory = history.filter(
      (entry) => now - entry.timestamp < 24 * 60 * 60 * 1000
    );

    const isDuplicate = updatedHistory.some(
      (entry) => entry.type === type && entry.entityId === entityId
    );

    if (!isDuplicate) {
      updatedHistory.push({
        type,
        entityId,
        timestamp: now,
      });
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
    }

    return isDuplicate;
  };

  const addNotification = useCallback(
    (notification: Omit<Notification, "id" | "timestamp" | "read">) => {
      if (!ROLE_NOTIFICATIONS[userRole].includes(notification.type)) {
        return;
      }

      // Check notification history first
      if (
        checkNotificationHistory(
          notification.type,
          notification.metadata?.entityId
        )
      ) {
        return;
      }

      const stored = localStorage.getItem(STORAGE_KEY);
      const existingNotifications = stored ? JSON.parse(stored) : [];

      // Check for duplicates based on type and metadata
      const isDuplicate = existingNotifications.some((n: Notification) => {
        if (n.type !== notification.type) return false;
        if (n.metadata?.entityId !== notification.metadata?.entityId)
          return false;
        const timeDiff = Date.now() - new Date(n.timestamp).getTime();
        return timeDiff < 300000;
      });

      if (isDuplicate) return;

      const newNotification: Notification = {
        ...notification,
        id: `not-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        read: false,
      };

      const updated = [newNotification, ...existingNotifications].slice(0, 100);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

      setNotifications((prev) => [newNotification, ...prev]);
      setUnreadCount((prev) => prev + 1);

      window.dispatchEvent(new Event("notificationUpdate"));
    },
    [userRole]
  );

  const deleteNotification = (id: string) => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const allNotifications = JSON.parse(stored);
      const updated = allNotifications.filter((n: Notification) => n.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

      setNotifications((prev) => prev.filter((n) => n.id !== id));
      // Update unread count if deleted notification was unread
      const wasUnread =
        allNotifications.find((n: Notification) => n.id === id)?.read === false;
      if (wasUnread) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }

      // Dispatch update event
      window.dispatchEvent(new Event("notificationUpdate"));
    }
  };

  const clearAllNotifications = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    setNotifications([]);
    setUnreadCount(0);
  };

  // Monitor changes
  useEffect(() => {
    const checkForChanges = async () => {
      try {
        const [ridersRes, deliveriesRes] = await Promise.all([
          fetch("/api/riders"),
          fetch("/api/deliveries"),
        ]);

        if (!ridersRes.ok || !deliveriesRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const [{ riders }, { deliveries }] = await Promise.all([
          ridersRes.json(),
          deliveriesRes.json(),
        ]);

        const currentStats: Stats = {
          ridersCount: riders.length,
          deliveriesCount: deliveries.length,
          deliveryStatuses: new Map(
            deliveries.map((d: DeliveryData) => [d._id, d.status])
          ),
          riderStatuses: new Map(
            riders.map((r: RiderData) => [r._id, r.status])
          ),
          paymentStatuses: new Map(
            deliveries.map((d: DeliveryData) => [d._id, d.payment_status])
          ),
        };

        // Check for rider count changes
        if (currentStats.ridersCount > prevStats.ridersCount) {
          const historyKey = `rider_count_${currentStats.ridersCount}`;
          if (!checkNotificationHistory("rider_new", historyKey)) {
            const diff = currentStats.ridersCount - prevStats.ridersCount;
            addNotification({
              type: "rider_new",
              title: "New Riders Registered",
              message: `${diff} new rider${diff > 1 ? "s" : ""} registered`,
              priority: "medium",
              forRoles: ["admin", "manager"],
              link: { path: "/list/riders" },
              metadata: { entityId: historyKey },
            });
          }
        }

        // Check delivery status changes
        currentStats.deliveryStatuses.forEach((status, id) => {
          const prevStatus = prevStats.deliveryStatuses.get(id);
          if (prevStatus && prevStatus !== status) {
            const historyKey = `delivery_${id}_${status}`;
            if (!checkNotificationHistory("delivery_status", historyKey)) {
              addNotification({
                type: "delivery_status",
                title: `Delivery Status Updated`,
                message: `Delivery #${id.slice(
                  0,
                  8
                )} changed from ${prevStatus} to ${status}`,
                priority: status === "failed" ? "high" : "medium",
                forRoles: ["admin", "manager", "support"],
                link: { path: "/list/tracking", query: { id } },
                metadata: { entityId: historyKey },
              });
            }
          }
        });

        // Check payment status changes
        currentStats.paymentStatuses.forEach((status, id) => {
          const prevStatus = prevStats.paymentStatuses.get(id);
          if (prevStatus && prevStatus !== status) {
            const historyKey = `payment_${id}_${status}`;
            if (!checkNotificationHistory("delivery_payment", historyKey)) {
              addNotification({
                type: "delivery_payment",
                title: "Payment Status Updated",
                message: `Payment for delivery #${id.slice(
                  0,
                  8
                )} changed to ${status}`,
                priority: status === "failed" ? "high" : "medium",
                forRoles: ["admin"],
                link: {
                  path: "/list/tracking",
                  query: { id },
                },
                metadata: { entityId: historyKey },
              });
            }
          }
        });

        // Check rider status changes
        currentStats.riderStatuses.forEach((status, id) => {
          const prevStatus = prevStats.riderStatuses.get(id);
          if (prevStatus && prevStatus !== status) {
            const historyKey = `rider_${id}_${status}`;
            if (!checkNotificationHistory("rider_status", historyKey)) {
              addNotification({
                type: "rider_status",
                title: "Rider Status Changed",
                message: `Rider #${id.slice(0, 8)} status changed to ${status}`,
                priority: "medium",
                forRoles: ["admin", "manager"],
                link: {
                  path: "/list/riders",
                  query: { id },
                },
                metadata: { entityId: historyKey },
              });
            }
          }
        });

        setPrevStats(currentStats);
      } catch (error) {
        console.error("Error monitoring changes:", error);
      }
    };

    // Initial check and interval setup
    checkForChanges();
    const intervalId = setInterval(checkForChanges, MONITORING_INTERVAL);
    return () => clearInterval(intervalId);
  }, [
    userRole,
    addNotification,
    prevStats.ridersCount,
    prevStats.deliveryStatuses,
    prevStats.paymentStatuses,
    prevStats.riderStatuses,
  ]);

  const markAsRead = (id: string) => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const allNotifications = JSON.parse(stored);
      const updated = allNotifications.map((n: Notification) =>
        n.id === id ? { ...n, read: true } : n
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
  };

  const markAllAsRead = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const allNotifications = JSON.parse(stored);
      const updated = allNotifications.map((n: Notification) => ({
        ...n,
        read: true,
      }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    }
  };

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
  };
};
