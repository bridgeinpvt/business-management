"use client";

import { Card, CardContent } from "@/components/ui/card";
import { CreditCard } from "lucide-react";

export default function PaymentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Payments</h1>
        <p className="text-muted-foreground">Manage your payment transactions</p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <CreditCard className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">Payments Coming Soon</h3>
          <p className="text-muted-foreground text-center">
            Payment management features will be available soon
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
