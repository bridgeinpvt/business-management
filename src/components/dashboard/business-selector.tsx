"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Building2, Plus } from "lucide-react";
import { api } from "@/trpc/react";
import Link from "next/link";

interface BusinessSelectorProps {
  selectedBusinessId: string;
  onBusinessChange: (businessId: string) => void;
}

export function BusinessSelector({ selectedBusinessId, onBusinessChange }: BusinessSelectorProps) {
  const { data: businesses, isLoading } = api.business.getMyBusinesses.useQuery();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!businesses || businesses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Your Businesses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No businesses yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Create your first business to start managing products and orders.
            </p>
            <Button asChild>
              <Link href="/create-business">
                <Plus className="w-4 h-4 mr-2" />
                Create Business
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Your Businesses
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/create-business">
              <Plus className="w-4 h-4 mr-2" />
              Add Business
            </Link>
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Select value={selectedBusinessId} onValueChange={onBusinessChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select a business" />
          </SelectTrigger>
          <SelectContent>
            {businesses.map((business) => (
              <SelectItem key={business.id} value={business.id}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    {business.logoUrl ? (
                      <img
                        src={business.logoUrl}
                        alt={business.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <Building2 className="w-4 h-4 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium">{business.name}</div>
                    <div className="text-sm text-gray-500">
                      {business._count.products} products • {business._count.orders} orders
                    </div>
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedBusinessId && (
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            {(() => {
              const selectedBusiness = businesses.find(b => b.id === selectedBusinessId);
              return selectedBusiness ? (
                <div>
                  <h4 className="font-medium text-blue-900 dark:text-blue-100">
                    {selectedBusiness.name}
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    {selectedBusiness.category} • {selectedBusiness.city || "Location not set"}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-blue-600 dark:text-blue-400">
                    <span>{selectedBusiness._count.products} Products</span>
                    <span>{selectedBusiness._count.customers} Customers</span>
                    <span>{selectedBusiness._count.orders} Orders</span>
                  </div>
                </div>
              ) : null;
            })()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}