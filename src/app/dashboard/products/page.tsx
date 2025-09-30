"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { ProductsHeader } from "@/components/products/products-header";
import { ProductsGrid } from "@/components/products/products-grid";
import { ProductFilters } from "@/components/products/product-filters";

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const businessId = searchParams.get("business") || "";

  const [filters, setFilters] = useState({
    search: "",
    category: "",
    status: "all",
    sortBy: "newest",
  });

  const [currentPage, setCurrentPage] = useState(1);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardHeader />

      <div className="container mx-auto px-4 py-8">
        <ProductsHeader businessId={businessId} />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <ProductFilters
              filters={filters}
              onFiltersChange={setFilters}
              businessId={businessId}
            />
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            <ProductsGrid
              businessId={businessId}
              filters={filters}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>
    </div>
  );
}