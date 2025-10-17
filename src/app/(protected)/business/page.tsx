"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Store, Edit, Trash2, Plus, MapPin, Phone, Mail, Globe, Check, X } from "lucide-react";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import type { RouterOutputs } from "@/trpc/shared";

type Business = RouterOutputs["business"]["getMyBusinesses"][number];

export default function BusinessPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState<Business | null>(null);

  // Get user's businesses
  const { data: businesses, isLoading, refetch } = api.business.getMyBusinesses.useQuery();

  // Mutations
  const createMutation = api.business.create.useMutation({
    onSuccess: () => {
      toast.success("Business created successfully!");
      setIsCreateDialogOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create business");
    },
  });

  const updateMutation = api.business.update.useMutation({
    onSuccess: () => {
      toast.success("Business updated successfully!");
      setEditingBusiness(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update business");
    },
  });

  const deleteMutation = api.business.delete.useMutation({
    onSuccess: () => {
      toast.success("Business deleted successfully!");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete business");
    },
  });

  const toggleActiveMutation = api.business.toggleActive.useMutation({
    onSuccess: () => {
      toast.success("Business status updated!");
      refetch();
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      description: formData.get("description") as string || undefined,
      category: formData.get("category") as string || undefined,
      contactEmail: formData.get("contactEmail") as string || undefined,
      contactPhone: formData.get("contactPhone") as string || undefined,
      address: formData.get("address") as string || undefined,
      city: formData.get("city") as string || undefined,
      state: formData.get("state") as string || undefined,
      zipCode: formData.get("zipCode") as string || undefined,
      website: formData.get("website") as string || undefined,
    };

    if (editingBusiness) {
      updateMutation.mutate({ id: editingBusiness.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Business</h1>
          <p className="text-muted-foreground">Manage your business information and settings</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Business
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Business</DialogTitle>
              <DialogDescription>Fill in the details to create your business</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="name">Business Name *</Label>
                  <Input id="name" name="name" required placeholder="My Business" />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Input id="description" name="description" placeholder="Brief description of your business" />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input id="category" name="category" placeholder="e.g., Retail, Food" />
                </div>
                <div>
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input id="contactEmail" name="contactEmail" type="email" placeholder="contact@business.com" />
                </div>
                <div>
                  <Label htmlFor="contactPhone">Contact Phone</Label>
                  <Input id="contactPhone" name="contactPhone" placeholder="+91 1234567890" />
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input id="website" name="website" type="url" placeholder="https://mybusiness.com" />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" name="address" placeholder="Street address" />
                </div>
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input id="city" name="city" placeholder="City" />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input id="state" name="state" placeholder="State" />
                </div>
                <div>
                  <Label htmlFor="zipCode">ZIP Code</Label>
                  <Input id="zipCode" name="zipCode" placeholder="123456" />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Creating..." : "Create Business"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {businesses && businesses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {businesses.map((business) => (
            <Card key={business.id} className="relative">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Store className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{business.name}</CardTitle>
                      <CardDescription className="text-sm">
                        {business.category || "No category"}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {business.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{business.description}</p>
                  )}
                  {business.address && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span className="truncate">{business.address}, {business.city}</span>
                    </div>
                  )}
                  {business.contactPhone && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Phone className="h-4 w-4 mr-2" />
                      <span>{business.contactPhone}</span>
                    </div>
                  )}
                  {business.contactEmail && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Mail className="h-4 w-4 mr-2" />
                      <span className="truncate">{business.contactEmail}</span>
                    </div>
                  )}
                  {business.website && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Globe className="h-4 w-4 mr-2" />
                      <a href={business.website} target="_blank" rel="noopener noreferrer" className="truncate hover:underline">
                        {business.website}
                      </a>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex space-x-2 text-sm">
                    <span className="font-semibold">{business._count?.products || 0}</span>
                    <span className="text-muted-foreground">Products</span>
                  </div>
                  <div className="flex space-x-2 text-sm">
                    <span className="font-semibold">{business._count?.orders || 0}</span>
                    <span className="text-muted-foreground">Orders</span>
                  </div>
                  <div className="flex space-x-2 text-sm">
                    <span className="font-semibold">{business._count?.customers || 0}</span>
                    <span className="text-muted-foreground">Customers</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant={business.isActive ? "default" : "outline"}
                      onClick={() => toggleActiveMutation.mutate({ id: business.id })}
                    >
                      {business.isActive ? <Check className="h-4 w-4 mr-1" /> : <X className="h-4 w-4 mr-1" />}
                      {business.isActive ? "Active" : "Inactive"}
                    </Button>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="ghost" onClick={() => setEditingBusiness(business)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        if (confirm("Are you sure you want to delete this business?")) {
                          deleteMutation.mutate({ id: business.id });
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Store className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Business Yet</h3>
            <p className="text-muted-foreground mb-6 text-center">
              Create your first business to start managing products and orders
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Business
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      {editingBusiness && (
        <Dialog open={!!editingBusiness} onOpenChange={() => setEditingBusiness(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Business</DialogTitle>
              <DialogDescription>Update your business information</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="edit-name">Business Name *</Label>
                  <Input id="edit-name" name="name" required defaultValue={editingBusiness.name} />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Input id="edit-description" name="description" defaultValue={editingBusiness.description || ""} />
                </div>
                <div>
                  <Label htmlFor="edit-category">Category</Label>
                  <Input id="edit-category" name="category" defaultValue={editingBusiness.category || ""} />
                </div>
                <div>
                  <Label htmlFor="edit-contactEmail">Contact Email</Label>
                  <Input id="edit-contactEmail" name="contactEmail" type="email" defaultValue={editingBusiness.contactEmail || ""} />
                </div>
                <div>
                  <Label htmlFor="edit-contactPhone">Contact Phone</Label>
                  <Input id="edit-contactPhone" name="contactPhone" defaultValue={editingBusiness.contactPhone || ""} />
                </div>
                <div>
                  <Label htmlFor="edit-website">Website</Label>
                  <Input id="edit-website" name="website" type="url" defaultValue={editingBusiness.website || ""} />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="edit-address">Address</Label>
                  <Input id="edit-address" name="address" defaultValue={editingBusiness.address || ""} />
                </div>
                <div>
                  <Label htmlFor="edit-city">City</Label>
                  <Input id="edit-city" name="city" defaultValue={editingBusiness.city || ""} />
                </div>
                <div>
                  <Label htmlFor="edit-state">State</Label>
                  <Input id="edit-state" name="state" defaultValue={editingBusiness.state || ""} />
                </div>
                <div>
                  <Label htmlFor="edit-zipCode">ZIP Code</Label>
                  <Input id="edit-zipCode" name="zipCode" defaultValue={editingBusiness.zipCode || ""} />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setEditingBusiness(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "Updating..." : "Update Business"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
