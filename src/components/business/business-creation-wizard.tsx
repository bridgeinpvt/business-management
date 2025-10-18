"use client";

import { useState } from "react";
import { toast } from "sonner";
import { api } from "@/trpc/react";

// Step Components
import { WelcomeStep } from "./steps/welcome-step";
import { BenefitsStep } from "./steps/benefits-step";
import { BusinessTypeStep } from "./steps/business-type-step";
import { BusinessNameStep } from "./steps/business-name-step";
import { CountryStep } from "./steps/country-step";
import { AdditionalDetailsStep } from "./steps/additional-details-step";
import { CongratulationsStep } from "./steps/congratulations-step";

interface BusinessCreationWizardProps {
  currentStep: number;
  onStepChange: (step: number) => void;
  onComplete: () => void;
}

interface BusinessData {
  businessType: string;
  name: string;
  country: string;
  description?: string;
  contactEmail?: string;
  contactPhone?: string;
}

export function BusinessCreationWizard({
  currentStep,
  onStepChange,
  onComplete,
}: BusinessCreationWizardProps) {
  const [businessData, setBusinessData] = useState<BusinessData>({
    businessType: "",
    name: "",
    country: "India",
    description: "",
    contactEmail: "",
    contactPhone: "",
  });

  const createBusinessMutation = api.business.create.useMutation({
    onSuccess: () => {
      toast.success("Business created successfully!");
      onStepChange(7); // Go to congratulations
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create business");
    },
  });

  const handleWelcomeContinue = () => {
    onStepChange(2);
  };

  const handleBusinessTypeSelect = (type: string) => {
    setBusinessData((prev) => ({ ...prev, businessType: type }));
  };

  const handleNameChange = (name: string) => {
    setBusinessData((prev) => ({ ...prev, name }));
  };

  const handleCountryChange = (country: string) => {
    setBusinessData((prev) => ({ ...prev, country }));
  };

  const handleDescriptionChange = (description: string) => {
    setBusinessData((prev) => ({ ...prev, description }));
  };

  const handleEmailChange = (contactEmail: string) => {
    setBusinessData((prev) => ({ ...prev, contactEmail }));
  };

  const handlePhoneChange = (contactPhone: string) => {
    setBusinessData((prev) => ({ ...prev, contactPhone }));
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!businessData.name || businessData.name.length < 2) {
      toast.error("Please enter a valid business name");
      return;
    }

    if (!businessData.businessType) {
      toast.error("Please select a business type");
      return;
    }

    // Create business
    try {
      await createBusinessMutation.mutateAsync({
        name: businessData.name,
        category: businessData.businessType,
        country: businessData.country,
        description: businessData.description || undefined,
        contactEmail: businessData.contactEmail || undefined,
        contactPhone: businessData.contactPhone || undefined,
      });
    } catch (error) {
      // Error is already handled by mutation's onError
      throw error;
    }
  };

  // Expose submit function via window for parent to call (AFTER it's defined)
  if (typeof window !== 'undefined') {
    (window as any)._submitBusiness = handleSubmit;
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <WelcomeStep onContinue={handleWelcomeContinue} />;
      case 2:
        return <BenefitsStep />;
      case 3:
        return (
          <BusinessTypeStep
            selectedType={businessData.businessType}
            onSelect={handleBusinessTypeSelect}
          />
        );
      case 4:
        return (
          <BusinessNameStep
            name={businessData.name}
            onChange={handleNameChange}
          />
        );
      case 5:
        return (
          <CountryStep
            country={businessData.country}
            onChange={handleCountryChange}
          />
        );
      case 6:
        return (
          <AdditionalDetailsStep
            description={businessData.description || ""}
            contactEmail={businessData.contactEmail || ""}
            contactPhone={businessData.contactPhone || ""}
            onDescriptionChange={handleDescriptionChange}
            onEmailChange={handleEmailChange}
            onPhoneChange={handlePhoneChange}
          />
        );
      case 7:
        return (
          <CongratulationsStep
            businessData={{
              name: businessData.name,
              businessType: businessData.businessType,
              country: businessData.country,
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div>
      {renderStep()}
    </div>
  );
}
