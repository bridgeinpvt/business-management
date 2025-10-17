"use client";

import { useState } from "react";
import { useForm, UseFormReturn, FieldValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/trpc/react";

// Step Components
import { BusinessInfoStep } from "./steps/business-info-step";
import { BusinessDetailsStep } from "./steps/business-details-step";
import { LocationStep } from "./steps/location-step";
import { PaymentSetupStep } from "./steps/payment-setup-step";
import { CategoriesStep } from "./steps/categories-step";
import { ProductsStep } from "./steps/products-step";
import { ReviewStep } from "./steps/review-step";

// Combined schema for all steps
const businessSchema = z.object({
  // Step 1: Business Info
  name: z.string().min(2, "Business name is required"),
  description: z.string().optional(),
  category: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),

  // Step 2: Business Details
  logoUrl: z.string().url().optional().or(z.literal("")),
  coverImageUrl: z.string().url().optional().or(z.literal("")),
  contactEmail: z.string().email().optional().or(z.literal("")),
  contactPhone: z.string().optional(),

  // Step 3: Location
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),

  // Step 4: Payment Setup
  upiId: z.string().optional(),
  bankAccount: z.string().optional(),
  ifscCode: z.string().optional(),
  gstin: z.string().optional(),

  // Step 5: Categories (handled separately)
  // Step 6: Products (handled separately)
});

type BusinessFormData = z.infer<typeof businessSchema>;

interface BusinessCreationWizardProps {
  currentStep: number;
  onStepChange: (step: number) => void;
  onComplete: () => void;
}

export function BusinessCreationWizard({
  currentStep,
  onStepChange,
  onComplete,
}: BusinessCreationWizardProps) {
  const [businessData, setBusinessData] = useState<Partial<BusinessFormData>>({
    country: "India",
  });
  const [categories, setCategories] = useState<Array<{ name: string; description?: string }>>([]);

  // Product type that matches what ProductsStep expects
  interface Product {
    name: string;
    description?: string;
    price: number;
    originalPrice?: number;
    category?: string;
    images: string[];
    inventory: number;
  }

  const [products, setProducts] = useState<Product[]>([]);

  const form = useForm<BusinessFormData>({
    resolver: zodResolver(businessSchema),
    defaultValues: businessData as BusinessFormData,
  });

  const createBusinessMutation = api.business.create.useMutation({
    onSuccess: () => {
      toast.success("Business created successfully!");
      onComplete();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create business");
    },
  });

  const canGoNext = () => {
    switch (currentStep) {
      case 1:
        return form.getValues("name")?.length >= 2;
      case 2:
        return true; // Optional fields
      case 3:
        return true; // Optional fields
      case 4:
        return true; // Optional fields
      case 5:
        return true; // Categories are optional
      case 6:
        return true; // Products are optional
      case 7:
        return true; // Review step
      default:
        return false;
    }
  };

  const handleNext = async () => {
    if (currentStep < 7) {
      // Save current step data
      const currentData = form.getValues();
      setBusinessData(prev => ({ ...prev, ...currentData }));
      onStepChange(currentStep + 1);
    } else {
      // Final step - create business
      await handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      onStepChange(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    const formData = form.getValues();
    const finalData = { ...businessData, ...formData };

    try {
      await createBusinessMutation.mutateAsync(finalData);
    } catch {
      // Error is handled in the mutation
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <BusinessInfoStep form={form as unknown as UseFormReturn<FieldValues>} />;
      case 2:
        return <BusinessDetailsStep form={form as unknown as UseFormReturn<FieldValues>} />;
      case 3:
        return <LocationStep form={form as unknown as UseFormReturn<FieldValues>} />;
      case 4:
        return <PaymentSetupStep form={form as unknown as UseFormReturn<FieldValues>} />;
      case 5:
        return (
          <CategoriesStep
            categories={categories}
            onCategoriesChange={setCategories}
          />
        );
      case 6:
        return (
          <ProductsStep
            products={products}
            onProductsChange={setProducts}
            categories={categories}
          />
        );
      case 7:
        return (
          <ReviewStep
            businessData={{ ...businessData, ...form.getValues() }}
            categories={categories}
            products={products}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {currentStep === 1 && "Tell us about your business"}
          {currentStep === 2 && "Add your business branding"}
          {currentStep === 3 && "Where is your business located?"}
          {currentStep === 4 && "Set up payment methods"}
          {currentStep === 5 && "Organize your products"}
          {currentStep === 6 && "Add your first products"}
          {currentStep === 7 && "Review and launch"}
        </CardTitle>
      </CardHeader>

      <CardContent>
        {renderStep()}
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 1}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Button
          onClick={handleNext}
          disabled={!canGoNext() || createBusinessMutation.isPending}
        >
          {currentStep === 7 ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              {createBusinessMutation.isPending ? "Creating..." : "Create Business"}
            </>
          ) : (
            <>
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}