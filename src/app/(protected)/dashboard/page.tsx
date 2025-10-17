"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Users, ShoppingCart, TrendingUp, Store, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  // Get user's businesses
  const { data: businesses, isLoading: businessesLoading } = api.business.getMyBusinesses.useQuery();

  // Get analytics for first business if exists
  const firstBusinessId = businesses?.[0]?.id;
  const { data: analytics, isLoading: analyticsLoading } = api.business.getAnalytics.useQuery(
    { businessId: firstBusinessId!, days: 30 },
    { enabled: !!firstBusinessId }
  );

  // Calculate percentage changes (mock data for now, can be enhanced)
  const stats = [
    {
      title: "Total Revenue",
      value: `₹${analytics?.revenue?.toFixed(2) || 0}`,
      description: "Last 30 days",
      icon: TrendingUp,
      change: "+12.5%",
      isPositive: true,
    },
    {
      title: "Orders",
      value: analytics?.orders || 0,
      description: "Total orders placed",
      icon: ShoppingCart,
      change: "+8.2%",
      isPositive: true,
    },
    {
      title: "Products",
      value: analytics?.products || 0,
      description: "Active products",
      icon: Package,
      change: "+3 new",
      isPositive: true,
    },
    {
      title: "Customers",
      value: analytics?.customers || 0,
      description: "Total customers",
      icon: Users,
      change: "+5.1%",
      isPositive: true,
    },
  ];

  if (businessesLoading || analyticsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If no business exists, show onboarding
  if (!businesses || businesses.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <Store className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Welcome to Nocage Business!</h2>
          <p className="text-muted-foreground mb-6">
            Get started by creating your first business
          </p>
          <Button onClick={() => router.push("/business")}>
            <Store className="mr-2 h-4 w-4" />
            Create Your Business
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here&apos;s an overview of your business.</p>
        </div>
        <Button onClick={() => router.push("/business")}>
          <Store className="mr-2 h-4 w-4" />
          View Business
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center text-xs mt-1">
                <span className="text-muted-foreground">{stat.description}</span>
                <span className={`ml-2 flex items-center ${stat.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.isPositive ? (
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 mr-1" />
                  )}
                  {stat.change}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest orders from your customers</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics?.recentOrders && analytics.recentOrders.length > 0 ? (
              <div className="space-y-4">
                {analytics.recentOrders.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                    <div>
                      <p className="font-medium">{order.user?.name || "Guest"}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.items.length} item(s)
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">₹{order.finalAmount?.toFixed(2)}</p>
                      <p className={`text-xs ${
                        order.status === 'DELIVERED' ? 'text-green-600' :
                        order.status === 'CANCELLED' ? 'text-red-600' :
                        'text-yellow-600'
                      }`}>
                        {order.status}
                      </p>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full" onClick={() => router.push("/orders")}>
                  View All Orders
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No orders yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
            <CardDescription>Best selling products</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics?.topProducts && analytics.topProducts.length > 0 ? (
              <div className="space-y-4">
                {analytics.topProducts.map((product, index) => (
                  <div key={product.id} className="flex items-center space-x-4 border-b pb-3 last:border-0">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {product.totalSales || 0} sold
                      </p>
                    </div>
                    <div className="font-semibold">₹{product.price?.toFixed(2)}</div>
                  </div>
                ))}
                <Button variant="outline" className="w-full" onClick={() => router.push("/products")}>
                  View All Products
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground mb-4">No products yet</p>
                <Button onClick={() => router.push("/products")}>Add Your First Product</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks to manage your business</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto py-4 flex-col" onClick={() => router.push("/products")}>
              <Package className="h-6 w-6 mb-2" />
              <span>Add Product</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col" onClick={() => router.push("/orders")}>
              <ShoppingCart className="h-6 w-6 mb-2" />
              <span>View Orders</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col" onClick={() => router.push("/customers")}>
              <Users className="h-6 w-6 mb-2" />
              <span>Manage Customers</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
