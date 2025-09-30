import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, ShoppingCart, Users, BarChart3, Package, CreditCard } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Business Management
            <span className="block text-blue-600 dark:text-blue-400">Platform</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Complete solution for entrepreneurs to manage their business, products, customers, and orders all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/create-business">Start Your Business</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/explore">Explore Businesses</Link>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <Building2 className="h-12 w-12 text-blue-600 mb-4" />
              <CardTitle>Business Management</CardTitle>
              <CardDescription>
                Create and manage your business profile with complete information and branding.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <Package className="h-12 w-12 text-green-600 mb-4" />
              <CardTitle>Product Catalog</CardTitle>
              <CardDescription>
                Add, edit, and organize your products with images, pricing, and inventory management.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <Users className="h-12 w-12 text-purple-600 mb-4" />
              <CardTitle>Customer Management</CardTitle>
              <CardDescription>
                Track your customers, their orders, and build lasting business relationships.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <ShoppingCart className="h-12 w-12 text-orange-600 mb-4" />
              <CardTitle>Order Processing</CardTitle>
              <CardDescription>
                Manage orders from placement to delivery with real-time status updates.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <BarChart3 className="h-12 w-12 text-red-600 mb-4" />
              <CardTitle>Analytics & Reports</CardTitle>
              <CardDescription>
                Get insights into your business performance with detailed analytics and reports.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <CreditCard className="h-12 w-12 text-indigo-600 mb-4" />
              <CardTitle>Payment Integration</CardTitle>
              <CardDescription>
                Secure payment processing with multiple payment methods and wallet integration.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* CTA Section */}
        <Card className="bg-blue-600 border-0 text-white">
          <CardContent className="p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Start Your Business?</h2>
            <p className="text-blue-100 mb-6">
              Join thousands of entrepreneurs who are already using our platform to grow their business.
            </p>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/auth/register">Get Started Today</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
