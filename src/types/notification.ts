export type NotificationType =
  | "delivery_new"
  | "delivery_status"
  | "delivery_payment"
  | "rider_new"
  | "rider_status"
  | "stats_update"
  | "transaction_new"
  | "transaction_status";

export type NotificationPriority = "high" | "medium" | "low";

export type UserRole = "admin" | "manager" | "support";

export const ROLE_NOTIFICATIONS: Record<UserRole, NotificationType[]> = {
  admin: [
    "delivery_new",
    "delivery_status",
    "delivery_payment",
    "rider_new",
    "rider_status",
    "stats_update",
    "transaction_new",
    "transaction_status",
  ],
  manager: [
    "delivery_new",
    "delivery_status",
    "rider_new",
    "rider_status",
    "transaction_new",
  ],
  support: ["delivery_status", "rider_status"],
};

export interface NotificationLink {
  path: string;
  query?: Record<string, string>;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: NotificationPriority;
  forRoles: UserRole[];
  metadata?: {
    entityId?: string;
    oldStatus?: string;
    newStatus?: string;
    amount?: number;
    rider?: string;
    customer?: string;
    location?: string;
  };
  link?: NotificationLink;
}
