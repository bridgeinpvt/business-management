"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Package, Plus, Edit, Trash2, Search, Eye, EyeOff, MoreHorizontal } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ColumnDef } from "@tanstack/react-table";
import type { RouterOutputs } from "@/trpc/shared";

type Product = RouterOutputs["product"]["getByBusinessId"]["products"][number];

export default function ProductsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Get user's businesses
  const { data: businesses } = api.business.getMyBusinesses.useQuery();
  const firstBusinessId = businesses?.[0]?.id;

  // Get products
  const { data: productsData, isLoading, refetch } = api.product.getByBusinessId.useQuery(
    {
      businessId: firstBusinessId!,
      page: 1,
      limit: 50,
      search: searchQuery || undefined,
      status: statusFilter,
      category: categoryFilter !== "all" ? categoryFilter : undefined,
    },
    { enabled: !!firstBusinessId }
  );

  // Get categories
  const { data: categories } = api.product.getCategories.useQuery(
    { businessId: firstBusinessId! },
    { enabled: !!firstBusinessId }
  );

  // Mutations
  const createMutation = api.product.create.useMutation({
    onSuccess: () => {
      toast.success("Product created successfully!");
      setIsCreateDialogOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create product");
    },
  });

  const updateMutation = api.product.update.useMutation({
    onSuccess: () => {
      toast.success("Product updated successfully!");
      setEditingProduct(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update product");
    },
  });

  const deleteMutation = api.product.delete.useMutation({
    onSuccess: () => {
      toast.success("Product deleted successfully!");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete product");
    },
  });

  const toggleActiveMutation = api.product.toggleActive.useMutation({
    onSuccess: () => {
      toast.success("Product status updated!");
      refetch();
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      description: formData.get("description") as string || undefined,
      shortDescription: formData.get("shortDescription") as string || undefined,
      price: parseFloat(formData.get("price") as string),
      originalPrice: formData.get("originalPrice") ? parseFloat(formData.get("originalPrice") as string) : undefined,
      category: formData.get("category") as string || undefined,
      inventory: parseInt(formData.get("inventory") as string) || 0,
      lowStockAlert: parseInt(formData.get("lowStockAlert") as string) || 5,
      businessId: firstBusinessId!,
    };

    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  // Table columns
  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: "image",
      header: "Image",
      cell: ({ row }) => {
        const product = row.original;
        const imageUrl = product.images?.[0];
        return (
          <Avatar className="h-10 w-10 rounded-md">
            <AvatarImage src={imageUrl} alt={product.name} />
            <AvatarFallback className="rounded-md bg-purple-100 text-purple-700">
              {product.name[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
        );
      },
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div>
            <p className="font-medium">{product.name}</p>
            {product.shortDescription && (
              <p className="text-sm text-muted-foreground line-clamp-1">
                {product.shortDescription}
              </p>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div>
            <p className="font-semibold">₹{product.price?.toFixed(2)}</p>
            {product.originalPrice && product.originalPrice > product.price && (
              <p className="text-xs text-muted-foreground line-through">
                ₹{product.originalPrice?.toFixed(2)}
              </p>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => {
        const category = row.original.category;
        return (
          <Badge variant="outline" className="font-normal">
            {category || "Uncategorized"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => {
        const product = row.original;
        return (
          <Badge variant={product.isActive ? "default" : "secondary"} className={product.isActive ? "bg-green-600" : ""}>
            {product.isActive ? "Active" : "Inactive"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "totalSales",
      header: "Sales",
      cell: ({ row }) => {
        return <span className="font-medium">{row.original.totalSales || 0}</span>;
      },
    },
    {
      accessorKey: "views",
      header: "Views",
      cell: ({ row }) => {
        return <span className="text-muted-foreground">{row.original.views || 0}</span>;
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const product = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setEditingProduct(product)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toggleActiveMutation.mutate({ id: product.id })}>
                {product.isActive ? (
                  <>
                    <EyeOff className="h-4 w-4 mr-2" />
                    Deactivate
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Activate
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => {
                  if (confirm("Delete this product?")) {
                    deleteMutation.mutate({ id: product.id });
                  }
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!firstBusinessId) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Package className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Business Found</h3>
          <p className="text-muted-foreground mb-6">Please create a business first to add products</p>
          <Button onClick={() => window.location.href = "/business"}>Create Business</Button>
        </CardContent>
      </Card>
    );
  }

  const ProductForm = ({ product }: { product?: Product }) => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label htmlFor="name">Product Name *</Label>
          <Input id="name" name="name" required placeholder="Product Name" defaultValue={product?.name} />
        </div>
        <div className="col-span-2">
          <Label htmlFor="shortDescription">Short Description</Label>
          <Input id="shortDescription" name="shortDescription" placeholder="Brief description" maxLength={200} defaultValue={product?.shortDescription || ""} />
        </div>
        <div className="col-span-2">
          <Label htmlFor="description">Full Description</Label>
          <Input id="description" name="description" placeholder="Detailed description" defaultValue={product?.description || ""} />
        </div>
        <div>
          <Label htmlFor="price">Price (₹) *</Label>
          <Input id="price" name="price" type="number" step="0.01" required placeholder="99.99" defaultValue={product?.price} />
        </div>
        <div>
          <Label htmlFor="originalPrice">Original Price (₹)</Label>
          <Input id="originalPrice" name="originalPrice" type="number" step="0.01" placeholder="149.99" defaultValue={product?.originalPrice || ""} />
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <Input id="category" name="category" placeholder="Electronics, Clothing, etc." defaultValue={product?.category || ""} />
        </div>
        <div>
          <Label htmlFor="inventory">Stock Quantity *</Label>
          <Input id="inventory" name="inventory" type="number" required defaultValue={product?.inventory ?? 0} />
        </div>
        <div className="col-span-2">
          <Label htmlFor="lowStockAlert">Low Stock Alert Threshold</Label>
          <Input id="lowStockAlert" name="lowStockAlert" type="number" defaultValue={product?.lowStockAlert ?? 5} />
        </div>
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={() => product ? setEditingProduct(null) : setIsCreateDialogOpen(false)}>
          Cancel
        </Button>
        <Button type="submit" disabled={product ? updateMutation.isPending : createMutation.isPending}>
          {product ? (updateMutation.isPending ? "Updating..." : "Update Product") : (createMutation.isPending ? "Creating..." : "Create Product")}
        </Button>
      </div>
    </form>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground">{productsData?.total || 0} total products</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="mr-2 h-4 w-4" />
              Add New Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
              <DialogDescription>Fill in the product details</DialogDescription>
            </DialogHeader>
            <ProductForm />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories?.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("all")}
                className={statusFilter === "all" ? "bg-purple-600 hover:bg-purple-700" : ""}
              >
                All
              </Button>
              <Button
                variant={statusFilter === "active" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("active")}
                className={statusFilter === "active" ? "bg-purple-600 hover:bg-purple-700" : ""}
              >
                Active
              </Button>
              <Button
                variant={statusFilter === "inactive" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("inactive")}
                className={statusFilter === "inactive" ? "bg-purple-600 hover:bg-purple-700" : ""}
              >
                Inactive
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      {productsData?.products && productsData.products.length > 0 ? (
        <DataTable columns={columns} data={productsData.products} pageSize={10} />
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Package className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Products Yet</h3>
            <p className="text-muted-foreground mb-6 text-center">Start adding products to your business catalog</p>
            <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-purple-600 hover:bg-purple-700">
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Product
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      {editingProduct && (
        <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Product</DialogTitle>
              <DialogDescription>Update product information</DialogDescription>
            </DialogHeader>
            <ProductForm product={editingProduct} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
