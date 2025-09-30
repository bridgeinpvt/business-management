"use client";

import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Upload, Image as ImageIcon } from "lucide-react";

interface BusinessDetailsStepProps {
  form: UseFormReturn<any>;
}

export function BusinessDetailsStep({ form }: BusinessDetailsStepProps) {
  const handleImageUpload = (field: any, type: 'logo' | 'cover') => {
    // TODO: Implement image upload logic
    // For now, just set a placeholder URL
    const placeholderUrl = type === 'logo'
      ? 'https://via.placeholder.com/150x150?text=Logo'
      : 'https://via.placeholder.com/800x300?text=Cover';
    field.onChange(placeholderUrl);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold mb-2">Make your business stand out</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Add branding and contact information to build trust with customers.
        </p>
      </div>

      <Form {...form}>
        <div className="space-y-6">
          {/* Logo Upload */}
          <FormField
            control={form.control}
            name="logoUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Business Logo</FormLabel>
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 dark:bg-gray-800">
                    {field.value ? (
                      <img
                        src={field.value}
                        alt="Logo preview"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleImageUpload(field, 'logo')}
                      className="w-full"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Logo
                    </Button>
                    <p className="text-xs text-gray-500 mt-2">
                      Recommended: 150x150px, PNG or JPG
                    </p>
                  </div>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Cover Image Upload */}
          <FormField
            control={form.control}
            name="coverImageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cover Image</FormLabel>
                <div className="space-y-4">
                  <div className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 dark:bg-gray-800">
                    {field.value ? (
                      <img
                        src={field.value}
                        alt="Cover preview"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="text-center">
                        <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Cover image preview</p>
                      </div>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleImageUpload(field, 'cover')}
                    className="w-full"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Cover Image
                  </Button>
                  <p className="text-xs text-gray-500">
                    Recommended: 800x300px, PNG or JPG. This will be displayed at the top of your business page.
                  </p>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="contactEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="business@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contactPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Phone</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="+91 9876543210"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </Form>

      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
        <p className="text-sm text-green-700 dark:text-green-300">
          ✅ <strong>Pro tip:</strong> Businesses with logos and contact information get 3x more customer inquiries!
        </p>
      </div>
    </div>
  );
}