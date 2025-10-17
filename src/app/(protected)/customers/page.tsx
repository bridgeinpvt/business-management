"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Users, Search, Phone, ShoppingCart, TrendingUp, User } from "lucide-react";
import { api } from "@/trpc/react";
import { formatDistanceToNow } from "date-fns";
import type { RouterOutputs } from "@/trpc/shared";

type Customer = RouterOutputs["customer"]["getByBusinessId"]["customers"][number];

export default function CustomersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Get user's businesses
  const { data: businesses } = api.business.getMyBusinesses.useQuery();
  const firstBusinessId = businesses?.[0]?.id;

  // Get customers
  const { data: customersData, isLoading } = api.customer.getByBusinessId.useQuery(
    {
      businessId: firstBusinessId!,
      page: 1,
      limit: 50,
      search: searchQuery || undefined,
    },
    { enabled: !!firstBusinessId }
  );

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
          <Users className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Business Found</h3>
          <p className="text-muted-foreground mb-6">Please create a business first</p>
          <Button onClick={() => window.location.href = "/business"}>Create Business</Button>
        </CardContent>
      </Card>
    );
  }

  const stats = [
    {
      title: "Total Customers",
      value: customersData?.total || 0,
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "New This Month",
      value: customersData?.customers?.filter((c) => {
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        return new Date(c.createdAt) > oneMonthAgo;
      }).length || 0,
      icon: TrendingUp,
      color: "text-green-600",
    },
    {
      title: "Active Customers",
      value: customersData?.customers?.filter((c) => c.isActive).length || 0,
      icon: ShoppingCart,
      color: "text-purple-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Customers</h1>
        <p className="text-muted-foreground">Manage your customer relationships</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search customers by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Customers List */}
      {customersData?.customers && customersData.customers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {customersData.customers.map((customer) => (
            <Card key={customer.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedCustomer(customer)}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{customer.user.name || 'N/A'}</CardTitle>
                      <CardDescription className="text-sm">{customer.user.email || 'N/A'}</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {customer.user.phone && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Phone className="h-4 w-4 mr-2" />
                    <span>{customer.user.phone}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="text-center">
                    <p className="text-2xl font-bold">0</p>
                    <p className="text-xs text-muted-foreground">Orders</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">₹0</p>
                    <p className="text-xs text-muted-foreground">Total Spent</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
                  <span>Customer since</span>
                  <span>{new Date(customer.createdAt).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Users className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Customers Yet</h3>
            <p className="text-muted-foreground text-center">
              Customers will appear here when they place orders
            </p>
          </CardContent>
        </Card>
      )}

      {/* Customer Details Dialog */}
      {selectedCustomer && (
        <Dialog open={!!selectedCustomer} onOpenChange={() => setSelectedCustomer(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Customer Details</DialogTitle>
              <DialogDescription>Complete customer information</DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              {/* Customer Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <p className="text-xl font-semibold">{selectedCustomer.user.name || 'N/A'}</p>
                      <p className="text-sm text-muted-foreground">{selectedCustomer.user.email || 'N/A'}</p>
                    </div>
                  </div>
                  {selectedCustomer.user.phone && (
                    <div className="flex items-center space-x-2 pt-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedCustomer.user.phone}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Customer Stats */}
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-3xl font-bold">0</p>
                    <p className="text-sm text-muted-foreground mt-1">Total Orders</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-3xl font-bold">₹0</p>
                    <p className="text-sm text-muted-foreground mt-1">Total Spent</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-3xl font-bold">₹0</p>
                    <p className="text-sm text-muted-foreground mt-1">Avg. Order Value</p>
                  </CardContent>
                </Card>
              </div>

              {/* Additional Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Additional Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Customer Since:</span>
                    <span className="font-medium">{new Date(selectedCustomer.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Updated:</span>
                    <span className="font-medium">
                      {formatDistanceToNow(new Date(selectedCustomer.updatedAt), { addSuffix: true })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Customer ID:</span>
                    <span className="font-mono text-sm">{selectedCustomer.id}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Notes Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedCustomer.notes ? (
                    <p className="text-sm">{selectedCustomer.notes}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No notes added yet</p>
                  )}
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setSelectedCustomer(null)}>
                  Close
                </Button>
                <Button onClick={() => {
                  // Navigate to orders filtered by this customer
                  window.location.href = `/orders?customerId=${selectedCustomer.id}`;
                }}>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  View Orders
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
