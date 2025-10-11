"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ShoppingCart, Search, Eye, Package, TrendingUp, Clock, CheckCircle, XCircle } from "lucide-react";
import { api } from "@/trpc/react";
import { formatDistanceToNow } from "date-fns";

export default function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  // Get user's businesses
  const { data: businesses } = api.business.getMyBusinesses.useQuery();
  const firstBusinessId = businesses?.[0]?.id;

  // Get orders
  const { data: ordersData, isLoading, refetch } = api.order.getByBusinessId.useQuery(
    {
      businessId: firstBusinessId!,
      page: 1,
      limit: 50,
      search: searchQuery || undefined,
      status: statusFilter !== "all" ? statusFilter : undefined,
    },
    { enabled: !!firstBusinessId }
  );

  // Update order status mutation
  const updateStatusMutation = api.order.updateStatus.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-500";
      case "CONFIRMED":
        return "bg-blue-500";
      case "PROCESSING":
        return "bg-purple-500";
      case "SHIPPED":
        return "bg-indigo-500";
      case "DELIVERED":
        return "bg-green-500";
      case "CANCELLED":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-500";
      case "COMPLETED":
        return "bg-green-500";
      case "FAILED":
        return "bg-red-500";
      case "REFUNDED":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!firstBusinessId) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Business Found</h3>
          <p className="text-muted-foreground mb-6">Please create a business first</p>
          <Button onClick={() => window.location.href = "/business"}>Create Business</Button>
        </CardContent>
      </Card>
    );
  }

  const stats = [
    {
      title: "Total Orders",
      value: ordersData?.total || 0,
      icon: ShoppingCart,
      color: "text-blue-600",
    },
    {
      title: "Pending",
      value: ordersData?.orders?.filter((o) => o.orderStatus === "PENDING").length || 0,
      icon: Clock,
      color: "text-yellow-600",
    },
    {
      title: "Completed",
      value: ordersData?.orders?.filter((o) => o.orderStatus === "DELIVERED").length || 0,
      icon: CheckCircle,
      color: "text-green-600",
    },
    {
      title: "Cancelled",
      value: ordersData?.orders?.filter((o) => o.orderStatus === "CANCELLED").length || 0,
      icon: XCircle,
      color: "text-red-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Orders</h1>
        <p className="text-muted-foreground">Manage your customer orders</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-3xl font-bold mt-2">{stat.value}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search orders by customer name or order ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant={statusFilter === "all" ? "default" : "outline"} size="sm" onClick={() => setStatusFilter("all")}>
            All
          </Button>
          <Button variant={statusFilter === "PENDING" ? "default" : "outline"} size="sm" onClick={() => setStatusFilter("PENDING")}>
            Pending
          </Button>
          <Button variant={statusFilter === "DELIVERED" ? "default" : "outline"} size="sm" onClick={() => setStatusFilter("DELIVERED")}>
            Delivered
          </Button>
          <Button variant={statusFilter === "CANCELLED" ? "default" : "outline"} size="sm" onClick={() => setStatusFilter("CANCELLED")}>
            Cancelled
          </Button>
        </div>
      </div>

      {/* Orders List */}
      {ordersData?.orders && ordersData.orders.length > 0 ? (
        <div className="space-y-4">
          {ordersData.orders.map((order) => (
            <Card key={order.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedOrder(order)}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-lg">Order #{order.orderNumber}</h3>
                      <Badge className={getStatusColor(order.orderStatus)}>
                        {order.orderStatus}
                      </Badge>
                      <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                        Payment: {order.paymentStatus}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Customer</p>
                        <p className="font-medium">{order.user?.name || "Guest"}</p>
                        <p className="text-xs text-muted-foreground">{order.user?.email}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Items</p>
                        <p className="font-medium">{order.items?.length || 0} item(s)</p>
                        <p className="text-xs text-muted-foreground">
                          {order.items?.slice(0, 2).map((item: any) => item.product?.name).join(", ")}
                          {order.items?.length > 2 && ` +${order.items.length - 2} more`}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Order Date</p>
                        <p className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">₹{order.finalAmount?.toFixed(2)}</p>
                    <Button variant="outline" size="sm" className="mt-2" onClick={(e) => {
                      e.stopPropagation();
                      setSelectedOrder(order);
                    }}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Orders Yet</h3>
            <p className="text-muted-foreground text-center">
              Orders from your customers will appear here
            </p>
          </CardContent>
        </Card>
      )}

      {/* Order Details Dialog */}
      {selectedOrder && (
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Order Details - #{selectedOrder.orderNumber}</DialogTitle>
              <DialogDescription>Complete order information</DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              {/* Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(selectedOrder.orderStatus)}>
                    {selectedOrder.orderStatus}
                  </Badge>
                  <Badge className={getPaymentStatusColor(selectedOrder.paymentStatus)}>
                    Payment: {selectedOrder.paymentStatus}
                  </Badge>
                </div>
                <div className="flex space-x-2">
                  {selectedOrder.orderStatus === "PENDING" && (
                    <Button size="sm" onClick={() => {
                      updateStatusMutation.mutate({ orderId: selectedOrder.id, status: "CONFIRMED" });
                      setSelectedOrder(null);
                    }}>
                      Confirm Order
                    </Button>
                  )}
                  {selectedOrder.orderStatus === "CONFIRMED" && (
                    <Button size="sm" onClick={() => {
                      updateStatusMutation.mutate({ orderId: selectedOrder.id, status: "PROCESSING" });
                      setSelectedOrder(null);
                    }}>
                      Start Processing
                    </Button>
                  )}
                  {selectedOrder.orderStatus === "PROCESSING" && (
                    <Button size="sm" onClick={() => {
                      updateStatusMutation.mutate({ orderId: selectedOrder.id, status: "SHIPPED" });
                      setSelectedOrder(null);
                    }}>
                      Mark as Shipped
                    </Button>
                  )}
                  {selectedOrder.orderStatus === "SHIPPED" && (
                    <Button size="sm" onClick={() => {
                      updateStatusMutation.mutate({ orderId: selectedOrder.id, status: "DELIVERED" });
                      setSelectedOrder(null);
                    }}>
                      Mark as Delivered
                    </Button>
                  )}
                </div>
              </div>

              {/* Customer Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Customer Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name:</span>
                    <span className="font-medium">{selectedOrder.user?.name || "Guest"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email:</span>
                    <span className="font-medium">{selectedOrder.user?.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phone:</span>
                    <span className="font-medium">{selectedOrder.shippingPhone || "N/A"}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Shipping Address</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{selectedOrder.shippingAddress}</p>
                  <p className="text-muted-foreground mt-1">
                    {selectedOrder.shippingCity}, {selectedOrder.shippingState} {selectedOrder.shippingZipCode}
                  </p>
                </CardContent>
              </Card>

              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Order Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedOrder.items?.map((item: any) => (
                      <div key={item.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                        <div className="flex items-center space-x-3">
                          <Package className="h-8 w-8 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{item.product?.name}</p>
                            <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">₹{(item.price * item.quantity)?.toFixed(2)}</p>
                          <p className="text-sm text-muted-foreground">₹{item.price?.toFixed(2)} each</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Order Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span>₹{selectedOrder.totalAmount?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping:</span>
                    <span>₹{selectedOrder.shippingAmount?.toFixed(2) || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Discount:</span>
                    <span className="text-green-600">-₹{selectedOrder.discountAmount?.toFixed(2) || 0}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total:</span>
                    <span>₹{selectedOrder.finalAmount?.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Payment Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment Method:</span>
                    <span className="font-medium">{selectedOrder.paymentMethod || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment Status:</span>
                    <Badge className={getPaymentStatusColor(selectedOrder.paymentStatus)}>
                      {selectedOrder.paymentStatus}
                    </Badge>
                  </div>
                  {selectedOrder.transactionId && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Transaction ID:</span>
                      <span className="font-mono text-sm">{selectedOrder.transactionId}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
