"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X, ShoppingBag, Upload, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

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

interface ProductsStepProps {
  products: Product[];
  onProductsChange: (products: Product[]) => void;
  categories: Category[];
}

export function ProductsStep({ products, onProductsChange, categories }: ProductsStepProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newProduct, setNewProduct] = useState<Product>({
    name: "",
    description: "",
    price: 0,
    originalPrice: 0,
    category: "",
    images: [],
    inventory: 0,
  });

  const handleAddProduct = () => {
    if (!newProduct.name.trim()) {
      toast.error("Product name is required");
      return;
    }

    if (newProduct.price <= 0) {
      toast.error("Price must be greater than 0");
      return;
    }

    onProductsChange([...products, newProduct]);
    setNewProduct({
      name: "",
      description: "",
      price: 0,
      originalPrice: 0,
      category: "",
      images: [],
      inventory: 0,
    });
    setIsAdding(false);
    toast.success("Product added successfully");
  };

  const handleRemoveProduct = (index: number) => {
    const updated = products.filter((_, i) => i !== index);
    onProductsChange(updated);
    toast.success("Product removed");
  };

  const handleImageUpload = () => {
    // TODO: Implement image upload logic
    // For now, just add a placeholder URL
    const placeholderUrl = `https://via.placeholder.com/300x300?text=Product+${newProduct.images.length + 1}`;
    setNewProduct(prev => ({
      ...prev,
      images: [...prev.images, placeholderUrl]
    }));
  };

  const removeImage = (index: number) => {
    setNewProduct(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <ShoppingBag className="w-12 h-12 text-blue-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Add your first products</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Start with a few products to showcase what you offer.
        </p>
      </div>

      {/* Add Product Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Plus className="w-5 h-5 mr-2" />
            Add Product
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!isAdding ? (
            <Button onClick={() => setIsAdding(true)} variant="outline" className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Product
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Product Name *</Label>
                  <Input
                    placeholder="e.g., Wireless Headphones"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Category</Label>
                  <Select
                    value={newProduct.category}
                    onValueChange={(value) => setNewProduct(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category, index) => (
                        <SelectItem key={index} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  placeholder="Describe your product features, benefits..."
                  value={newProduct.description}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Price (₹) *</Label>
                  <Input
                    type="number"
                    placeholder="999"
                    value={newProduct.price || ""}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label>Original Price (₹)</Label>
                  <Input
                    type="number"
                    placeholder="1299"
                    value={newProduct.originalPrice || ""}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, originalPrice: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label>Stock Quantity</Label>
                  <Input
                    type="number"
                    placeholder="50"
                    value={newProduct.inventory || ""}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, inventory: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>

              {/* Product Images */}
              <div>
                <Label>Product Images</Label>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {newProduct.images.map((image, index) => (
                    <div key={index} className="relative">
                      <Image
                        src={image}
                        alt={`Product ${index + 1}`}
                        width={300}
                        height={300}
                        className="w-full h-20 object-cover rounded border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-1 -right-1 h-5 w-5 p-0"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  {newProduct.images.length < 4 && (
                    <Button
                      type="button"
                      variant="outline"
                      className="h-20 border-dashed"
                      onClick={handleImageUpload}
                    >
                      <div className="text-center">
                        <Upload className="w-4 h-4 mx-auto mb-1" />
                        <span className="text-xs">Add Image</span>
                      </div>
                    </Button>
                  )}
                </div>
                <p className="text-xs text-gray-500">Add up to 4 product images</p>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleAddProduct} size="sm">
                  Add Product
                </Button>
                <Button
                  onClick={() => {
                    setIsAdding(false);
                    setNewProduct({
                      name: "",
                      description: "",
                      price: 0,
                      originalPrice: 0,
                      category: "",
                      images: [],
                      inventory: 0,
                    });
                  }}
                  variant="outline"
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Current Products */}
      {products.length > 0 && (
        <div>
          <Label className="text-sm font-medium mb-3 block">Your Products ({products.length})</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {products.map((product, index) => (
              <Card key={index} className="relative">
                <CardContent className="p-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 h-6 w-6 p-0"
                    onClick={() => handleRemoveProduct(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                  <div className="flex gap-3">
                    <div className="w-16 h-16 bg-gray-100 rounded border flex items-center justify-center">
                      {product.images.length > 0 ? (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          width={300}
                          height={300}
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium mb-1 pr-8">{product.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {product.category}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">₹{product.price}</span>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <span className="text-sm text-gray-500 line-through">
                            ₹{product.originalPrice}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Stock: {product.inventory}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
        <p className="text-sm text-orange-700 dark:text-orange-300">
          🛍️ <strong>Getting started:</strong> Add 3-5 products to give customers a good sense of what you offer. You can add more products anytime from your dashboard.
        </p>
      </div>

      {products.length === 0 && (
        <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
          <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h4 className="font-medium text-gray-600 dark:text-gray-400 mb-2">No products yet</h4>
          <p className="text-sm text-gray-500">
            Add some products to start selling, or skip this step and add them later.
          </p>
        </div>
      )}
    </div>
  );
}