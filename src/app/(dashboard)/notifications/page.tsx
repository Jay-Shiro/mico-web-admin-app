"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useNotifications } from "@/hooks/useNotifications";
import {
  Notification,
  NotificationType,
  NotificationPriority,
  ROLE_NOTIFICATIONS,
} from "@/types/notification";
import {
  Bell,
  Box,
  User,
  TrendingUp,
  Filter,
  Search,
  RefreshCw,
  Truck,
  ChevronRight,
  MessageSquare,
  DollarSign,
  Check,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const NotificationsCenter = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const userRole =
    (session?.user?.role as "admin" | "manager" | "support") || "support";
  const { notifications, unreadCount, markAsRead, deleteNotification } =
    useNotifications(userRole);

  const [searchQuery, setSearchQuery] = useState("");

  // Filter notifications based on role and search
  const filteredNotifications = notifications.filter((notification) => {
    if (!ROLE_NOTIFICATIONS[userRole].includes(notification.type)) return false;

    return searchQuery
      ? notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          notification.message.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
  });

  // Handle notification click with error handling
  const handleNotificationClick = (notification: Notification) => {
    try {
      markAsRead(notification.id);

      // Handle navigation based on notification type
      let path = "/";
      switch (notification.type) {
        case "rider_new":
        case "rider_status":
          path = "/list/riders";
          break;
        case "delivery_new":
        case "delivery_status":
        case "delivery_payment":
          path = "/list/tracking";
          break;
        case "transaction_new":
        case "transaction_status":
          path = "/list/transactions";
          break;
        case "stats_update":
          path = "/dashboard";
          break;
      }

      // Add query parameters if available
      if (notification.metadata?.entityId) {
        path += `?id=${notification.metadata.entityId}`;
      }

      router.push(path);
    } catch (error) {
      console.error("Error handling notification:", error);
    }
  };

  const handleDeleteNotification = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent notification click
    deleteNotification(id);
  };

  // Get notification icon by type
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case "delivery_new":
      case "stats_update":
        return <Box className="h-5 w-5" />;
      case "delivery_status":
        return <Truck className="h-5 w-5" />;
      case "delivery_payment":
      case "transaction_new":
      case "transaction_status":
        return <DollarSign className="h-5 w-5" />;
      case "rider_new":
        return <User className="h-5 w-5" />;
      case "rider_status":
        return <TrendingUp className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  // Get priority color
  const getPriorityStyle = (priority: NotificationPriority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-600 border-red-200";
      case "medium":
        return "bg-color1lite text-color1 border-color1";
      case "low":
        return "bg-gray-100 text-gray-600 border-gray-200";
      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  // Format relative time
  const getRelativeTime = (timestamp: string) => {
    const now = new Date();
    const notifDate = new Date(timestamp);
    const diffMs = now.getTime() - notifDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return notifDate.toLocaleDateString();
  };

  // Navigation handler with type safety
  const handleNavigate = (link: Notification["link"]) => {
    if (!link) return;

    try {
      const { path, query } = link;
      const queryString = query
        ? `?${new URLSearchParams(query).toString()}`
        : "";
      router.push(`${path}${queryString}`);
    } catch (error) {
      console.error("Navigation error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-color3lite">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Simplified controls */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <h1 className="text-xl font-semibold text-gray-800">
              Notifications ({unreadCount} unread)
            </h1>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-color1 text-sm"
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24">
              <Bell className="h-12 w-12 text-gray-300" />
              <h3 className="mt-4 text-lg font-medium text-gray-800">
                No notifications found
              </h3>
              <p className="mt-2 text-gray-500 text-center max-w-md">
                We couldn't find any notifications matching your criteria. Try
                adjusting your filters.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              <AnimatePresence>
                {filteredNotifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`relative p-4 hover:bg-gray-50 cursor-pointer transition ${
                      !notification.read ? "border-l-4 border-color1" : ""
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <button
                      onClick={(e) =>
                        handleDeleteNotification(e, notification.id)
                      }
                      className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-200 transition-colors"
                    >
                      <X className="h-4 w-4 text-gray-400" />
                    </button>
                    <div className="sm:flex sm:justify-between sm:items-center">
                      <div className="flex">
                        <div
                          className={`mr-3 rounded-full p-2 ${getPriorityStyle(
                            notification.priority
                          )}`}
                        >
                          {getNotificationIcon(notification.type)}
                        </div>

                        <div>
                          <h4 className="text-sm font-semibold text-gray-800 flex items-center">
                            {!notification.read && (
                              <span className="inline-block w-2 h-2 bg-color1 rounded-full mr-2" />
                            )}
                            {notification.title}
                          </h4>
                          <p className="mt-1 text-sm text-gray-600">
                            {notification.message}
                          </p>
                        </div>
                      </div>

                      <div className="mt-2 sm:mt-0 text-right flex flex-col items-end">
                        <span className="text-xs text-gray-500">
                          {getRelativeTime(notification.timestamp)}
                        </span>
                        {notification.link && (
                          <div className="flex mt-2">
                            <button
                              className="text-color1 hover:text-color2 text-xs font-medium flex items-center"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleNavigate(notification.link);
                              }}
                            >
                              View Details
                              <ChevronRight className="h-3 w-3 ml-1" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsCenter;
