"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Link2, Plus, Copy, MoreHorizontal, ExternalLink, TrendingUp } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
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

type TrackingLink = RouterOutputs["trackingLink"]["getByBusinessId"]["trackingLinks"][number];

export default function TrackingLinksPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Get user's businesses
  const { data: businesses } = api.business.getMyBusinesses.useQuery();
  const firstBusinessId = businesses?.[0]?.id;

  // Get tracking links
  const { data: trackingLinksData, isLoading, refetch } = api.trackingLink.getByBusinessId.useQuery(
    { businessId: firstBusinessId! },
    { enabled: !!firstBusinessId }
  );

  // Mutations
  const createMutation = api.trackingLink.create.useMutation({
    onSuccess: () => {
      toast.success("Tracking link created successfully!");
      setIsCreateDialogOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create tracking link");
    },
  });

  const deleteMutation = api.trackingLink.delete.useMutation({
    onSuccess: () => {
      toast.success("Tracking link deleted successfully!");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete tracking link");
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      campaignName: formData.get("campaignName") as string,
      targetUrl: formData.get("targetUrl") as string,
      utmSource: formData.get("utmSource") as string || undefined,
      utmMedium: formData.get("utmMedium") as string || undefined,
      utmCampaign: formData.get("utmCampaign") as string || undefined,
      businessId: firstBusinessId!,
    };

    createMutation.mutate(data);
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard!");
  };

  // Table columns
  const columns: ColumnDef<TrackingLink>[] = [
    {
      accessorKey: "campaignName",
      header: "Campaign",
      cell: ({ row }) => {
        const link = row.original;
        return (
          <div>
            <p className="font-medium">{link.campaignName}</p>
            <p className="text-sm text-muted-foreground line-clamp-1">{link.targetUrl}</p>
          </div>
        );
      },
    },
    {
      accessorKey: "utmSource",
      header: "Source",
      cell: ({ row }) => {
        return (
          <Badge variant="outline" className="font-normal">
            {row.original.utmSource || "N/A"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "utmMedium",
      header: "Medium",
      cell: ({ row }) => {
        return (
          <Badge variant="outline" className="font-normal">
            {row.original.utmMedium || "N/A"}
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
                  if (confirm("Delete this tracking link?")) {
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
          <Link2 className="h-16 w-16 text-muted-foreground mb-4" />
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
          <h1 className="text-3xl font-bold">Tracking Links</h1>
          <p className="text-muted-foreground">Create and manage campaign tracking links with UTM parameters</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="mr-2 h-4 w-4" />
              Create Tracking Link
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Tracking Link</DialogTitle>
              <DialogDescription>Add UTM parameters to track your marketing campaigns</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="campaignName">Campaign Name *</Label>
                <Input id="campaignName" name="campaignName" required placeholder="Summer Sale 2024" />
              </div>
              <div>
                <Label htmlFor="targetUrl">Target URL *</Label>
                <Input id="targetUrl" name="targetUrl" required placeholder="https://example.com/products" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="utmSource">UTM Source</Label>
                  <Input id="utmSource" name="utmSource" placeholder="facebook, google, newsletter" />
                </div>
                <div>
                  <Label htmlFor="utmMedium">UTM Medium</Label>
                  <Input id="utmMedium" name="utmMedium" placeholder="social, cpc, email" />
                </div>
              </div>
              <div>
                <Label htmlFor="utmCampaign">UTM Campaign</Label>
                <Input id="utmCampaign" name="utmCampaign" placeholder="summer_sale" />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending} className="bg-purple-600 hover:bg-purple-700">
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
                <p className="text-2xl font-bold mt-1">{trackingLinksData?.total || 0}</p>
              </div>
              <Link2 className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Clicks</p>
                <p className="text-2xl font-bold mt-1">
                  {trackingLinksData?.trackingLinks?.reduce((sum, link) => sum + link.clicks, 0) || 0}
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
                  {trackingLinksData?.trackingLinks?.reduce((sum, link) => sum + link.conversions, 0) || 0}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Conv. Rate</p>
                <p className="text-2xl font-bold mt-1">
                  {trackingLinksData?.trackingLinks && trackingLinksData.trackingLinks.length > 0
                    ? (
                        (trackingLinksData.trackingLinks.reduce((sum, link) => {
                          return sum + (link.clicks > 0 ? (link.conversions / link.clicks) * 100 : 0);
                        }, 0) / trackingLinksData.trackingLinks.length)
                      ).toFixed(2)
                    : "0.00"}
                  %
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tracking Links Table */}
      {trackingLinksData?.trackingLinks && trackingLinksData.trackingLinks.length > 0 ? (
        <DataTable columns={columns} data={trackingLinksData.trackingLinks} pageSize={10} />
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Link2 className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Tracking Links Yet</h3>
            <p className="text-muted-foreground text-center mb-6">
              Create tracking links to monitor your marketing campaigns
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
