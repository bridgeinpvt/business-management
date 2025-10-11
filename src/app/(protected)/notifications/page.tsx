"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, BellOff, Check, CheckCheck, Package, ShoppingCart, Users, TrendingUp } from "lucide-react";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState("all");

  // Get notifications
  const { data: allNotifications, isLoading, refetch } = api.notification.getNotifications.useQuery({
    limit: 50,
    unreadOnly: false,
  });

  const { data: unreadNotifications } = api.notification.getNotifications.useQuery({
    limit: 50,
    unreadOnly: true,
  });

  // Mutations
  const markAsReadMutation = api.notification.markAsRead.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const markAllAsReadMutation = api.notification.markAllAsRead.useMutation({
    onSuccess: () => {
      toast.success("All notifications marked as read");
      refetch();
    },
  });

  const deleteNotificationMutation = api.notification.deleteNotification.useMutation({
    onSuccess: () => {
      toast.success("Notification deleted");
      refetch();
    },
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "ORDER":
        return <ShoppingCart className="h-5 w-5 text-blue-600" />;
      case "PRODUCT":
        return <Package className="h-5 w-5 text-green-600" />;
      case "CUSTOMER":
        return <Users className="h-5 w-5 text-purple-600" />;
      case "REVENUE":
        return <TrendingUp className="h-5 w-5 text-yellow-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const notifications = activeTab === "unread" ? unreadNotifications : allNotifications;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">
            {unreadNotifications?.length || 0} unread notification{unreadNotifications?.length !== 1 ? 's' : ''}
          </p>
        </div>
        {allNotifications && allNotifications.length > 0 && (
          <Button
            variant="outline"
            onClick={() => markAllAsReadMutation.mutate()}
            disabled={markAllAsReadMutation.isPending}
          >
            <CheckCheck className="mr-2 h-4 w-4" />
            Mark All as Read
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">
            All ({allNotifications?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="unread">
            Unread ({unreadNotifications?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {notifications && notifications.length > 0 ? (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={`${
                    !notification.isRead ? "border-primary bg-primary/5" : ""
                  } transition-all hover:shadow-md`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                      <div className={`flex-shrink-0 p-2 rounded-lg ${
                        !notification.isRead ? "bg-primary/10" : "bg-muted"
                      }`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className={`font-semibold ${
                              !notification.isRead ? "text-foreground" : "text-muted-foreground"
                            }`}>
                              {notification.title}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            {!notification.isRead && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => markAsReadMutation.mutate({ notificationId: notification.id })}
                                title="Mark as read"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                if (confirm("Delete this notification?")) {
                                  deleteNotificationMutation.mutate({ notificationId: notification.id });
                                }
                              }}
                              title="Delete"
                            >
                              <BellOff className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Bell className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  {activeTab === "unread" ? "No Unread Notifications" : "No Notifications"}
                </h3>
                <p className="text-muted-foreground text-center">
                  {activeTab === "unread"
                    ? "You're all caught up! No unread notifications."
                    : "You don't have any notifications yet."}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
