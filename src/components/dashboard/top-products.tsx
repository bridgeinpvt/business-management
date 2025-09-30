"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/trpc/react";
import { Package, Star } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface TopProductsProps {
  businessId: string;
  timeRange: number;
}

export function TopProducts({ businessId, timeRange }: TopProductsProps) {
  const { data: analytics, isLoading } = api.business.getAnalytics.useQuery(
    { businessId, days: timeRange },
    { enabled: !!businessId }
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-200 rounded"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const topProducts = analytics?.topProducts || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5" />
          Top Products
        </CardTitle>
      </CardHeader>
      <CardContent>
        {topProducts.length > 0 ? (
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div key={product.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <Package className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium truncate">{product.name}</h4>
                    <Badge variant="secondary" className="text-xs">
                      #{index + 1}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <span>{product.totalSales} sold</span>
                    <span>{formatCurrency(product.price)}</span>
                    {product.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span>{product.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-semibold text-green-600">
                    {formatCurrency(product.price * product.totalSales)}
                  </div>
                  <div className="text-sm text-gray-500">Revenue</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="font-medium text-gray-600 dark:text-gray-400 mb-2">No sales data</h4>
            <p className="text-sm text-gray-500">
              Start selling products to see your top performers here.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}