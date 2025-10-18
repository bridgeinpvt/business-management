"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Search, Download, Plus, MoreHorizontal } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import type { RouterOutputs } from "@/trpc/shared";

type Customer = RouterOutputs["customer"]["getByBusinessId"]["customers"][number];

export default function CustomersPage() {
  const [searchQuery, setSearchQuery] = useState("");

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

  // Export data query
  const { refetch: exportData, isFetching: isExporting } = api.customer.exportData.useQuery(
    {
      businessId: firstBusinessId!,
      search: searchQuery || undefined,
    },
    {
      enabled: false,
      onSuccess: (data) => {
        // Convert to CSV
        const headers = ["Name", "Email", "Phone", "Total Spent", "Order Count", "Last Order Date", "Last Order Status", "Join Date", "Notes"];
        const rows = data.map((customer) => [
          customer.name,
          customer.email,
          customer.phone,
          customer.totalSpent,
          customer.orderCount,
          customer.lastOrderDate,
          customer.lastOrderStatus,
          customer.joinDate,
          customer.notes,
        ]);

        const csvContent = [
          headers.join(","),
          ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
        ].join("\n");

        // Download CSV
        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `customers-${new Date().toISOString().split("T")[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        toast.success("Customer data exported successfully!");
      },
    }
  );

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Table columns
  const columns: ColumnDef<Customer>[] = [
    {
      accessorKey: "avatar",
      header: "Avatar",
      cell: ({ row }) => {
        const customer = row.original;
        return (
          <Avatar className="h-10 w-10">
            <AvatarImage src={customer.user.image || undefined} alt={customer.user.name || ""} />
            <AvatarFallback className="bg-purple-100 text-purple-700">
              {customer.user.name?.[0]?.toUpperCase() || customer.user.email?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
        );
      },
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => {
        const customer = row.original;
        return (
          <div>
            <p className="font-medium">{customer.user.name || "N/A"}</p>
            <p className="text-sm text-muted-foreground">@{customer.userId.slice(0, 8)}</p>
          </div>
        );
      },
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => {
        return <span className="text-sm">{row.original.user.email || "N/A"}</span>;
      },
    },
    {
      accessorKey: "createdAt",
      header: "Join Date",
      cell: ({ row }) => {
        return (
          <span className="text-sm text-muted-foreground">
            {new Date(row.original.createdAt).toLocaleDateString()}
          </span>
        );
      },
    },
    {
      accessorKey: "totalSpent",
      header: "Total Spent",
      cell: ({ row }) => {
        return <span className="font-semibold">{formatCurrency(row.original.totalSpent)}</span>;
      },
    },
    {
      accessorKey: "orderCount",
      header: "Orders",
      cell: ({ row }) => {
        return <span className="font-medium">{row.original.orderCount}</span>;
      },
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => {
        const customer = row.original;
        return (
          <Badge variant={customer.isActive ? "default" : "secondary"} className={customer.isActive ? "bg-green-600" : ""}>
            {customer.isActive ? "Active" : "Inactive"}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const customer = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => window.location.href = `/orders?customerId=${customer.id}`}>
                View Orders
              </DropdownMenuItem>
              <DropdownMenuItem>
                Send Email
              </DropdownMenuItem>
              <DropdownMenuItem>
                Add Note
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
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
          <Button onClick={() => window.location.href = "/create-business"} className="bg-purple-600 hover:bg-purple-700">
            Create Business
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Customers</h1>
          <p className="text-muted-foreground">{customersData?.total || 0} total customers</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => exportData()}
            disabled={isExporting || !customersData?.customers?.length}
          >
            <Download className="mr-2 h-4 w-4" />
            {isExporting ? "Exporting..." : "Export Data"}
          </Button>
          <Button className="bg-purple-600 hover:bg-purple-700">
            <Plus className="mr-2 h-4 w-4" />
            Add Customer
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search customers by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      {customersData?.customers && customersData.customers.length > 0 ? (
        <DataTable columns={columns} data={customersData.customers} pageSize={10} />
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Users className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Customers Yet</h3>
            <p className="text-muted-foreground text-center mb-6">
              Customers will appear here when they place orders
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
