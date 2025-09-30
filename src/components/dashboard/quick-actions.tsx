"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Plus, ShoppingCart, Users, BarChart3 } from "lucide-react";
import Link from "next/link";

interface QuickActionsProps {
  businessId: string;
}

export function QuickActions({ businessId }: QuickActionsProps) {
  if (!businessId) {
    return null;
  }

  const actions = [
    {
      title: "Add Product",
      description: "Add new products to your catalog",
      icon: Package,
      href: `/dashboard/products/new?business=${businessId}`,
      color: "bg-green-500",
    },
    {
      title: "View Orders",
      description: "Check recent orders and status",
      icon: ShoppingCart,
      href: `/dashboard/orders?business=${businessId}`,
      color: "bg-blue-500",
    },
    {
      title: "Customers",
      description: "Manage customer relationships",
      icon: Users,
      href: `/dashboard/customers?business=${businessId}`,
      color: "bg-purple-500",
    },
    {
      title: "Analytics",
      description: "View detailed business insights",
      icon: BarChart3,
      href: `/dashboard/analytics?business=${businessId}`,
      color: "bg-orange-500",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Button
              key={action.title}
              variant="outline"
              className="w-full justify-start h-auto p-4"
              asChild
            >
              <Link href={action.href}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${action.color}`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">{action.title}</div>
                    <div className="text-sm text-gray-500">{action.description}</div>
                  </div>
                </div>
              </Link>
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
}