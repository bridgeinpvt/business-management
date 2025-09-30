"use client";

import { useState } from "react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { RecentOrders } from "@/components/dashboard/recent-orders";
import { TopProducts } from "@/components/dashboard/top-products";
import { BusinessSelector } from "@/components/dashboard/business-selector";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { SalesChart } from "@/components/dashboard/sales-chart";

export default function DashboardPage() {
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>("");
  const [timeRange, setTimeRange] = useState<number>(30);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardHeader />

      <div className="container mx-auto px-4 py-8">
        {/* Business Selector & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <BusinessSelector
              selectedBusinessId={selectedBusinessId}
              onBusinessChange={setSelectedBusinessId}
            />
          </div>
          <div>
            <QuickActions businessId={selectedBusinessId} />
          </div>
        </div>

        {selectedBusinessId ? (
          <>
            {/* Stats Overview */}
            <DashboardStats
              businessId={selectedBusinessId}
              timeRange={timeRange}
              onTimeRangeChange={setTimeRange}
            />

            {/* Charts and Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <SalesChart businessId={selectedBusinessId} timeRange={timeRange} />
              <TopProducts businessId={selectedBusinessId} timeRange={timeRange} />
            </div>

            {/* Recent Activity */}
            <RecentOrders businessId={selectedBusinessId} />
          </>
        ) : (
          <div className="text-center py-16">
            <h3 className="text-xl font-semibold mb-4">Welcome to Your Dashboard</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Select a business or create your first business to get started.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}