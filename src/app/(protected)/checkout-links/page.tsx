"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ExternalLink, Plus, Copy, MoreHorizontal, ShoppingCart, TrendingUp } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

type CheckoutLink = RouterOutputs["checkoutLink"]["getByBusinessId"]["checkoutLinks"][number];

export default function CheckoutLinksPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string>("");

  // Get user's businesses
  const { data: businesses } = api.business.getMyBusinesses.useQuery();
  const firstBusinessId = businesses?.[0]?.id;

  // Get products for dropdown
  const { data: productsData } = api.product.getByBusinessId.useQuery(
    {
      businessId: firstBusinessId!,
      page: 1,
      limit: 50,
      status: "active",
    },
    { enabled: !!firstBusinessId }
  );

  // Get checkout links
  const { data: checkoutLinksData, isLoading, refetch } = api.checkoutLink.getByBusinessId.useQuery(
    { businessId: firstBusinessId! },
    { enabled: !!firstBusinessId }
  );

  // Mutations
  const createMutation = api.checkoutLink.create.useMutation({
    onSuccess: () => {
      toast.success("Checkout link created successfully!");
      setIsCreateDialogOpen(false);
      setSelectedProductId("");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create checkout link");
    },
  });

  const deleteMutation = api.checkoutLink.delete.useMutation({
    onSuccess: () => {
      toast.success("Checkout link deleted successfully!");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete checkout link");
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedProductId) {
      toast.error("Please select a product");
      return;
    }

    createMutation.mutate({
      productId: selectedProductId,
      businessId: firstBusinessId!,
    });
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard!");
  };

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
  const columns: ColumnDef<CheckoutLink>[] = [
    {
      accessorKey: "product",
      header: "Product",
      cell: ({ row }) => {
        const link = row.original;
        return (
          <div>
            <p className="font-medium">{link.product.name}</p>
            <p className="text-sm text-muted-foreground">{formatCurrency(link.product.price)}</p>
          </div>
        );
      },
    },
    {
      accessorKey: "shortCode",
      header: "Short Code",
      cell: ({ row }) => {
        return (
          <Badge variant="outline" className="font-mono">
            {row.original.shortCode}
          </Badge>
        );
      },
    },
    {
      accessorKey: "clicks",
      header: "Clicks",
      cell: ({ row }) => {
        return <span className="font-semibold text-purple-600">{row.original.clicks}</span>;
      },
    },
    {
      accessorKey: "conversions",
      header: "Conversions",
      cell: ({ row }) => {
        return <span className="font-semibold text-green-600">{row.original.conversions}</span>;
      },
    },
    {
      accessorKey: "revenue",
      header: "Revenue",
      cell: ({ row }) => {
        return <span className="font-semibold">{formatCurrency(row.original.revenue)}</span>;
      },
    },
    {
      accessorKey: "conversionRate",
      header: "Conv. Rate",
      cell: ({ row }) => {
        const link = row.original;
        const rate = link.clicks > 0 ? ((link.conversions / link.clicks) * 100).toFixed(2) : "0.00";
        return <span className="text-sm font-medium">{rate}%</span>;
      },
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => {
        const link = row.original;
        return (
          <Badge variant={link.isActive ? "default" : "secondary"} className={link.isActive ? "bg-green-600" : ""}>
            {link.isActive ? "Active" : "Inactive"}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const link = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => copyToClipboard(link.fullUrl)}>
                <Copy className="h-4 w-4 mr-2" />
                Copy Link
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.open(link.fullUrl, "_blank")}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Link
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => {
                  if (confirm("Delete this checkout link?")) {
                    deleteMutation.mutate({ id: link.id });
                  }
                }}
              >
                Delete
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
          <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
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
          <h1 className="text-3xl font-bold">Checkout Links</h1>
          <p className="text-muted-foreground">Create direct checkout links for your products</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="mr-2 h-4 w-4" />
              Create Checkout Link
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Checkout Link</DialogTitle>
              <DialogDescription>Generate a direct checkout link for a product</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="product">Select Product *</Label>
                <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a product" />
                  </SelectTrigger>
                  <SelectContent>
                    {productsData?.products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} - {formatCurrency(product.price)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!productsData?.products.length && (
                  <p className="text-sm text-muted-foreground mt-2">
                    No active products found. Please add products first.
                  </p>
                )}
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || !selectedProductId}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {createMutation.isPending ? "Creating..." : "Create Link"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Links</p>
                <p className="text-2xl font-bold mt-1">{checkoutLinksData?.total || 0}</p>
              </div>
              <ExternalLink className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Clicks</p>
                <p className="text-2xl font-bold mt-1">
                  {checkoutLinksData?.checkoutLinks?.reduce((sum, link) => sum + link.clicks, 0) || 0}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conversions</p>
                <p className="text-2xl font-bold mt-1">
                  {checkoutLinksData?.checkoutLinks?.reduce((sum, link) => sum + link.conversions, 0) || 0}
                </p>
              </div>
              <ShoppingCart className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold mt-1">
                  {formatCurrency(
                    checkoutLinksData?.checkoutLinks?.reduce((sum, link) => sum + link.revenue, 0) || 0
                  )}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Checkout Links Table */}
      {checkoutLinksData?.checkoutLinks && checkoutLinksData.checkoutLinks.length > 0 ? (
        <DataTable columns={columns} data={checkoutLinksData.checkoutLinks} pageSize={10} />
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <ExternalLink className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Checkout Links Yet</h3>
            <p className="text-muted-foreground text-center mb-6">
              Create checkout links to sell products directly
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-purple-600 hover:bg-purple-700">
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Link
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
