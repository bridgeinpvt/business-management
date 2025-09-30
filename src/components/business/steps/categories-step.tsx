"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Plus, X, FolderPlus, Package } from "lucide-react";
import { toast } from "sonner";

interface Category {
  name: string;
  description?: string;
}

interface CategoriesStepProps {
  categories: Category[];
  onCategoriesChange: (categories: Category[]) => void;
}

export function CategoriesStep({ categories, onCategoriesChange }: CategoriesStepProps) {
  const [newCategory, setNewCategory] = useState<Category>({ name: "", description: "" });
  const [isAdding, setIsAdding] = useState(false);

  const handleAddCategory = () => {
    if (!newCategory.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    if (categories.some(cat => cat.name.toLowerCase() === newCategory.name.toLowerCase())) {
      toast.error("Category already exists");
      return;
    }

    onCategoriesChange([...categories, newCategory]);
    setNewCategory({ name: "", description: "" });
    setIsAdding(false);
    toast.success("Category added successfully");
  };

  const handleRemoveCategory = (index: number) => {
    const updated = categories.filter((_, i) => i !== index);
    onCategoriesChange(updated);
    toast.success("Category removed");
  };

  const handleAddPredefined = (categoryName: string) => {
    if (categories.some(cat => cat.name.toLowerCase() === categoryName.toLowerCase())) {
      toast.error("Category already exists");
      return;
    }
    onCategoriesChange([...categories, { name: categoryName }]);
  };

  const predefinedCategories = [
    "Electronics", "Clothing", "Home & Garden", "Sports", "Books",
    "Health & Beauty", "Toys", "Automotive", "Food & Beverages", "Jewelry"
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Package className="w-12 h-12 text-blue-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Organize your products</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Create categories to help customers find products easily.
        </p>
      </div>

      {/* Quick Add Predefined Categories */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Quick Add Categories</Label>
        <div className="flex flex-wrap gap-2">
          {predefinedCategories.map((category) => (
            <Button
              key={category}
              variant="outline"
              size="sm"
              onClick={() => handleAddPredefined(category)}
              disabled={categories.some(cat => cat.name.toLowerCase() === category.toLowerCase())}
            >
              <Plus className="w-3 h-3 mr-1" />
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Custom Category Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <FolderPlus className="w-5 h-5 mr-2" />
            Create Custom Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!isAdding ? (
            <Button onClick={() => setIsAdding(true)} variant="outline" className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Custom Category
            </Button>
          ) : (
            <div className="space-y-4">
              <div>
                <Label>Category Name *</Label>
                <Input
                  placeholder="e.g., Premium Collection"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label>Description (Optional)</Label>
                <Textarea
                  placeholder="Describe this category..."
                  value={newCategory.description}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddCategory} size="sm">
                  Add Category
                </Button>
                <Button
                  onClick={() => {
                    setIsAdding(false);
                    setNewCategory({ name: "", description: "" });
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

      {/* Current Categories */}
      {categories.length > 0 && (
        <div>
          <Label className="text-sm font-medium mb-3 block">Your Categories ({categories.length})</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {categories.map((category, index) => (
              <Card key={index} className="relative">
                <CardContent className="p-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 h-6 w-6 p-0"
                    onClick={() => handleRemoveCategory(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                  <h4 className="font-medium mb-1 pr-8">{category.name}</h4>
                  {category.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {category.description}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
        <p className="text-sm text-purple-700 dark:text-purple-300">
          📂 <strong>Tip:</strong> Good categories make it easier for customers to browse your products. You can always add more categories later from your dashboard.
        </p>
      </div>

      {categories.length === 0 && (
        <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h4 className="font-medium text-gray-600 dark:text-gray-400 mb-2">No categories yet</h4>
          <p className="text-sm text-gray-500">
            Add categories to organize your products, or skip this step and add them later.
          </p>
        </div>
      )}
    </div>
  );
}