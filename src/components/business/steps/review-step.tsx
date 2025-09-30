"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Building2, MapPin, CreditCard, Package, ShoppingBag, AlertCircle } from "lucide-react";

interface BusinessData {
  name?: string;
  description?: string;
  category?: string;
  website?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  upiId?: string;
  bankAccount?: string;
  ifscCode?: string;
  gstin?: string;
}

interface Category {
  name: string;
  description?: string;
}

interface Product {
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  category?: string;
  images: string[];
  inventory: number;
}

interface ReviewStepProps {
  businessData: BusinessData;
  categories: Category[];
  products: Product[];
}

export function ReviewStep({ businessData, categories, products }: ReviewStepProps) {
  const hasBasicInfo = businessData.name;
  const hasLocation = businessData.city || businessData.address;
  const hasPayment = businessData.upiId || businessData.bankAccount;
  const hasContent = categories.length > 0 || products.length > 0;

  const completionItems = [
    { label: "Business Information", completed: hasBasicInfo, icon: Building2 },
    { label: "Location Details", completed: hasLocation, icon: MapPin },
    { label: "Payment Setup", completed: hasPayment, icon: CreditCard },
    { label: "Products/Categories", completed: hasContent, icon: Package },
  ];

  const completedCount = completionItems.filter(item => item.completed).length;
  const completionRate = (completedCount / completionItems.length) * 100;

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Review and Launch</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Almost done! Review your business setup and launch when ready.
        </p>
      </div>

      {/* Completion Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Setup Progress</span>
            <Badge variant={completionRate === 100 ? "default" : "secondary"}>
              {completedCount}/{completionItems.length} Complete
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {completionItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${item.completed ? 'text-green-600' : 'text-gray-400'}`} />
                  <span className={`text-sm ${item.completed ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500'}`}>
                    {item.label}
                  </span>
                  {item.completed ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Business Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Business Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Basic Information</h4>
              <div className="space-y-1 text-sm">
                <p><strong>Name:</strong> {businessData.name || "Not set"}</p>
                <p><strong>Category:</strong> {businessData.category || "Not set"}</p>
                <p><strong>Website:</strong> {businessData.website || "Not set"}</p>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Contact & Location</h4>
              <div className="space-y-1 text-sm">
                <p><strong>Email:</strong> {businessData.contactEmail || "Not set"}</p>
                <p><strong>Phone:</strong> {businessData.contactPhone || "Not set"}</p>
                <p><strong>Location:</strong> {businessData.city ? `${businessData.city}, ${businessData.state}` : "Not set"}</p>
              </div>
            </div>
          </div>

          {businessData.description && (
            <div className="mt-4">
              <h4 className="font-medium mb-2">Description</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">{businessData.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Information */}
      {hasPayment && (
        <Card>
          <CardHeader>
            <CardTitle>Payment Setup</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {businessData.upiId && (
                <div>
                  <h4 className="font-medium mb-2">UPI Payment</h4>
                  <p className="text-sm">{businessData.upiId}</p>
                </div>
              )}
              {businessData.bankAccount && (
                <div>
                  <h4 className="font-medium mb-2">Bank Account</h4>
                  <p className="text-sm">
                    Account: {businessData.bankAccount}<br />
                    IFSC: {businessData.ifscCode}
                  </p>
                </div>
              )}
              {businessData.gstin && (
                <div>
                  <h4 className="font-medium mb-2">GST Information</h4>
                  <p className="text-sm">{businessData.gstin}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Categories */}
      {categories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Categories ({categories.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {categories.map((category, index) => (
                <Badge key={index} variant="outline">
                  {category.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Products */}
      {products.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              Products ({products.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {products.slice(0, 4).map((product, index) => (
                <div key={index} className="flex items-center gap-3 p-3 border rounded">
                  <div className="w-12 h-12 bg-gray-100 rounded">
                    {product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover rounded"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-4 h-4 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h5 className="font-medium text-sm">{product.name}</h5>
                    <p className="text-xs text-gray-500">₹{product.price}</p>
                  </div>
                </div>
              ))}
              {products.length > 4 && (
                <div className="text-center text-sm text-gray-500 md:col-span-2">
                  ... and {products.length - 4} more products
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Launch Readiness */}
      <Card className={completionRate === 100 ? "border-green-200 bg-green-50 dark:bg-green-900/20" : "border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20"}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {completionRate === 100 ? (
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            )}
            <div>
              <h4 className={`font-medium ${completionRate === 100 ? 'text-green-900 dark:text-green-100' : 'text-yellow-900 dark:text-yellow-100'}`}>
                {completionRate === 100 ? "Ready to Launch!" : "Almost Ready"}
              </h4>
              <p className={`text-sm ${completionRate === 100 ? 'text-green-700 dark:text-green-300' : 'text-yellow-700 dark:text-yellow-300'}`}>
                {completionRate === 100
                  ? "Your business is fully set up and ready to start accepting orders."
                  : "You can launch with the current setup and complete the remaining steps later from your dashboard."
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}