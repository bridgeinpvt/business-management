"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Users, CreditCard, TrendingUp, Store, Plus } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  // Get user's businesses
  const { data: businesses, isLoading: businessesLoading } = api.business.getMyBusinesses.useQuery();

  // Get analytics for first business if exists
  const firstBusinessId = businesses?.[0]?.id;
  const { data: dashboardStats, isLoading: statsLoading } = api.business.getDashboardStats.useQuery(
    { businessId: firstBusinessId! },
    { enabled: !!firstBusinessId }
  );

  const { data: revenueGrowth, isLoading: revenueLoading } = api.business.getRevenueGrowth.useQuery(
    { businessId: firstBusinessId!, months: 6 },
    { enabled: !!firstBusinessId }
  );

  const { data: analytics } = api.business.getAnalytics.useQuery(
    { businessId: firstBusinessId!, days: 30 },
    { enabled: !!firstBusinessId }
  );

  if (businessesLoading || statsLoading || revenueLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // If no business exists, show onboarding
  if (!businesses || businesses.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <Store className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Welcome to Business Management!</h2>
          <p className="text-muted-foreground mb-6">
            Get started by creating your first business
          </p>
          <Button onClick={() => router.push("/create-business")} className="bg-purple-600 hover:bg-purple-700">
            <Store className="mr-2 h-4 w-4" />
            Create Your Business
          </Button>
        </div>
      </div>
    );
  }

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here&apos;s an overview of your business.</p>
        </div>
        <Button onClick={() => router.push("/products")} className="bg-purple-600 hover:bg-purple-700">
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Revenue"
          value={formatCurrency(dashboardStats?.revenue?.value || 0)}
          icon={TrendingUp}
          description="Last 30 days"
          trend={{
            value: dashboardStats?.revenue?.growth || 0,
            isPositive: (dashboardStats?.revenue?.growth || 0) >= 0,
          }}
        />
        <StatCard
          title="Products"
          value={dashboardStats?.products?.value || 0}
          icon={Package}
          description="Active products"
        />
        <StatCard
          title="Customers"
          value={dashboardStats?.customers?.value || 0}
          icon={Users}
          description={`${dashboardStats?.customers?.new || 0} new this month`}
        />
        <StatCard
          title="Conversion Rate"
          value={`${(dashboardStats?.conversionRate?.value || 0).toFixed(2)}%`}
          icon={CreditCard}
          description="View to purchase"
        />
      </div>

      {/* Revenue Chart */}
      {revenueGrowth && revenueGrowth.length > 0 && (
        <RevenueChart data={revenueGrowth} />
      )}

      {/* Recent Activity and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity - Takes 2 columns */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest orders and updates</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics?.recentOrders && analytics.recentOrders.length > 0 ? (
              <div className="space-y-4">
                {analytics.recentOrders.slice(0, 6).map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-purple-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium">{order.user?.name || "Guest"}</p>
                        <p className="text-sm text-muted-foreground">
                          {order.items.length} item(s) • {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(order.finalAmount || 0)}</p>
                      <p className={`text-xs font-medium ${
                        order.status === 'DELIVERED' ? 'text-green-600' :
                        order.status === 'CANCELLED' ? 'text-red-600' :
                        'text-yellow-600'
                      }`}>
                        {order.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No recent activity</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions - Takes 1 column */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your business</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start hover:bg-purple-50"
                onClick={() => router.push("/products")}
              >
                <Package className="h-4 w-4 mr-2" />
                <span>Add Product</span>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start hover:bg-purple-50"
                onClick={() => router.push("/customers")}
              >
                <Users className="h-4 w-4 mr-2" />
                <span>View Customers</span>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start hover:bg-purple-50"
                onClick={() => router.push("/checkout-links")}
              >
                <Plus className="h-4 w-4 mr-2" />
                <span>Create Checkout Link</span>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start hover:bg-purple-50"
                onClick={() => router.push("/tracking-links")}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                <span>Create Tracking Link</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
