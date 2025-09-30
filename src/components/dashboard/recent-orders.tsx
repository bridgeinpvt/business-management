"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { ShoppingCart, Eye } from "lucide-react";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import Link from "next/link";

interface RecentOrdersProps {
  businessId: string;
}

const statusColors = {
  PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  CONFIRMED: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  PROCESSING: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  SHIPPED: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
  DELIVERED: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

export function RecentOrders({ businessId }: RecentOrdersProps) {
  const { data: analytics, isLoading } = api.business.getAnalytics.useQuery(
    { businessId, days: 30 },
    { enabled: !!businessId }
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-20"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const recentOrders = analytics?.recentOrders || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Recent Orders
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/orders?business=${businessId}`}>
              View All
            </Link>
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recentOrders.length > 0 ? (
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-medium">#{order.orderNumber}</span>
                    <Badge className={statusColors[order.status as keyof typeof statusColors]}>
                      {order.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <div>Customer: {order.user.name || order.user.email}</div>
                    <div>
                      Items: {order.items.map(item => item.product.name).join(", ")}
                    </div>
                    <div>{formatDateTime(new Date(order.createdAt))}</div>
                  </div>
                </div>

                <div className="text-right flex items-center gap-3">
                  <div>
                    <div className="font-semibold">{formatCurrency(order.finalAmount)}</div>
                    <div className="text-sm text-gray-500">
                      {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/dashboard/orders/${order.id}`}>
                      <Eye className="w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="font-medium text-gray-600 dark:text-gray-400 mb-2">No orders yet</h4>
            <p className="text-sm text-gray-500">
              Your recent orders will appear here once customers start ordering.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}