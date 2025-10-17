"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/trpc/react";
import { BarChart3 } from "lucide-react";

interface SalesChartProps {
  businessId: string;
  timeRange: number;
}

export function SalesChart({ businessId, timeRange }: SalesChartProps) {
  const { data: orderAnalytics, isLoading } = api.order.getOrderAnalytics.useQuery(
    { businessId, days: timeRange },
    { enabled: !!businessId }
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sales Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const dailyData = orderAnalytics?.dailyData || {};
  const dates = Object.keys(dailyData).sort();
  const maxRevenue = Math.max(...Object.values(dailyData).map((d: { revenue: number; orders: number }) => d.revenue));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Sales Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                ₹{orderAnalytics?.totalRevenue?.toLocaleString() || 0}
              </div>
              <div className="text-sm text-gray-500">Total Revenue</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {orderAnalytics?.completedOrders || 0}
              </div>
              <div className="text-sm text-gray-500">Completed Orders</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                ₹{Math.round(orderAnalytics?.averageOrderValue || 0)}
              </div>
              <div className="text-sm text-gray-500">Avg. Order Value</div>
            </div>
          </div>

          {/* Simple Bar Chart */}
          <div className="h-64 flex items-end gap-1 p-4">
            {dates.length > 0 ? (
              dates.map((date) => {
                const data = dailyData[date];
                const height = maxRevenue > 0 ? (data.revenue / maxRevenue) * 200 : 0;
                return (
                  <div key={date} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-blue-500 rounded-t min-h-[4px] flex items-end justify-center"
                      style={{ height: `${Math.max(height, 4)}px` }}
                      title={`${date}: ₹${data.revenue} (${data.orders} orders)`}
                    >
                      {height > 20 && (
                        <span className="text-xs text-white mb-1">
                          {data.orders}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 writing-mode-vertical transform rotate-45">
                      {new Date(date).getDate()}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="w-full h-32 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No sales data available</p>
                </div>
              </div>
            )}
          </div>

          {/* Completion Rate */}
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Order Completion Rate</span>
              <span className="text-sm text-green-600 font-medium">
                {Math.round(orderAnalytics?.completionRate || 0)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all"
                style={{ width: `${orderAnalytics?.completionRate || 0}%` }}
              ></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}