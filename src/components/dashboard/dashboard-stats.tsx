"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, ShoppingCart, Users, Package, TrendingUp, TrendingDown } from "lucide-react";
import { api } from "@/trpc/react";
import { formatCurrency } from "@/lib/utils";

interface DashboardStatsProps {
  businessId: string;
  timeRange: number;
  onTimeRangeChange: (range: number) => void;
}

export function DashboardStats({ businessId, timeRange, onTimeRangeChange }: DashboardStatsProps) {
  const { data: analytics, isLoading } = api.business.getAnalytics.useQuery(
    { businessId, days: timeRange },
    { enabled: !!businessId }
  );

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const stats = [
    {
      title: "Total Revenue",
      value: formatCurrency(analytics?.revenue || 0),
      icon: DollarSign,
      change: "+12.5%",
      changeType: "positive" as const,
      description: `Last ${timeRange} days`,
    },
    {
      title: "Orders",
      value: analytics?.orders || 0,
      icon: ShoppingCart,
      change: "+8.2%",
      changeType: "positive" as const,
      description: `${analytics?.orders || 0} total orders`,
    },
    {
      title: "Customers",
      value: analytics?.customers || 0,
      icon: Users,
      change: "+5.1%",
      changeType: "positive" as const,
      description: "Active customers",
    },
    {
      title: "Products",
      value: analytics?.products || 0,
      icon: Package,
      change: "+2.3%",
      changeType: "positive" as const,
      description: "In catalog",
    },
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Business Overview</h2>
        <Select value={timeRange.toString()} onValueChange={(value) => onTimeRangeChange(parseInt(value))}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
            <SelectItem value="365">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  {stat.changeType === "positive" ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  )}
                  <span className={stat.changeType === "positive" ? "text-green-500" : "text-red-500"}>
                    {stat.change}
                  </span>
                  <span>from last period</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}