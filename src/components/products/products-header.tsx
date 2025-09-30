"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, Plus, Download, Upload } from "lucide-react";
import { api } from "@/trpc/react";
import Link from "next/link";

interface ProductsHeaderProps {
  businessId: string;
}

export function ProductsHeader({ businessId }: ProductsHeaderProps) {
  const { data: businesses } = api.business.getMyBusinesses.useQuery();

  const selectedBusiness = businesses?.find(b => b.id === businessId);

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Package className="w-8 h-8 text-blue-600" />
            Product Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your product catalog, inventory, and pricing
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-2" />
            Import Products
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button asChild>
            <Link href={`/dashboard/products/new?business=${businessId}`}>
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Link>
          </Button>
        </div>
      </div>

      {/* Business Selector */}
      {businesses && businesses.length > 1 && (
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium">Business:</label>
              <Select value={businessId}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Select business" />
                </SelectTrigger>
                <SelectContent>
                  {businesses.map((business) => (
                    <SelectItem key={business.id} value={business.id}>
                      {business.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Business Info */}
      {selectedBusiness && (
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                {selectedBusiness.logoUrl ? (
                  <img
                    src={selectedBusiness.logoUrl}
                    alt={selectedBusiness.name}
                    className="w-full h-full rounded-lg object-cover"
                  />
                ) : (
                  <Package className="w-6 h-6 text-blue-600" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{selectedBusiness.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedBusiness.category} • {selectedBusiness._count.products} products
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Total Products</div>
                <div className="text-2xl font-bold text-blue-600">
                  {selectedBusiness._count.products}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}