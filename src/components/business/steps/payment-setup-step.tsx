"use client";

import { UseFormReturn, FieldValues } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { CreditCard, Smartphone, Building, FileText } from "lucide-react";

interface PaymentSetupStepProps {
  form: UseFormReturn<FieldValues>;
}

export function PaymentSetupStep({ form }: PaymentSetupStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <CreditCard className="w-12 h-12 text-blue-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Set up payment methods</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Configure how you&apos;ll receive payments from customers.
        </p>
      </div>

      <Form {...form}>
        <div className="space-y-6">
          {/* UPI Payment */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center mb-3">
              <Smartphone className="w-5 h-5 text-green-600 mr-2" />
              <h4 className="font-medium">UPI Payment</h4>
            </div>
            <FormField
              control={form.control}
              name="upiId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>UPI ID</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="your-name@paytm / your-name@phonepe"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Customers can pay directly to your UPI ID
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Bank Account */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center mb-3">
              <Building className="w-5 h-5 text-blue-600 mr-2" />
              <h4 className="font-medium">Bank Account</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="bankAccount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="1234567890"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ifscCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>IFSC Code</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="HDFC0001234"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* GST Information */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center mb-3">
              <FileText className="w-5 h-5 text-purple-600 mr-2" />
              <h4 className="font-medium">GST Information</h4>
            </div>
            <FormField
              control={form.control}
              name="gstin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>GSTIN</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="22AAAAA0000A1Z5"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Required if your annual turnover exceeds ₹20 lakhs
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </Form>

      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <p className="text-sm text-blue-700 dark:text-blue-300">
          🔒 <strong>Security:</strong> All payment information is encrypted and secure. You can update these details anytime from your dashboard.
        </p>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          ℹ️ <strong>Note:</strong> You can skip this step and add payment methods later. However, customers won&apos;t be able to place orders until payment methods are configured.
        </p>
      </div>
    </div>
  );
}