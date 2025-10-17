"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BusinessCreationWizard } from "@/components/business/business-creation-wizard";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Building2 } from "lucide-react";

const STEPS = [
  { id: 1, title: "Business Information", description: "Basic details about your business" },
  { id: 2, title: "Business Details", description: "Logo, cover image, and contact info" },
  { id: 3, title: "Location & Address", description: "Where is your business located" },
  { id: 4, title: "Payment Setup", description: "Payment methods and banking details" },
  { id: 5, title: "Business Categories", description: "Organize your product categories" },
  { id: 6, title: "Initial Products", description: "Add your first products" },
  { id: 7, title: "Review & Launch", description: "Review and activate your business" },
];

export default function CreateBusinessPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const router = useRouter();

  const progress = (currentStep / STEPS.length) * 100;

  const handleComplete = () => {
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Building2 className="h-12 w-12 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Create Your Business
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1]?.title}
          </p>
        </div>

        {/* Progress Bar */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="mb-4" />
            <div className="grid grid-cols-7 gap-2 text-xs">
              {STEPS.map((step) => (
                <div
                  key={step.id}
                  className={`text-center p-2 rounded ${
                    step.id === currentStep
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                      : step.id < currentStep
                      ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                      : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                  }`}
                >
                  <div className="font-medium">{step.id}</div>
                  <div className="hidden sm:block">{step.title}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Wizard Content */}
        <BusinessCreationWizard
          currentStep={currentStep}
          onStepChange={setCurrentStep}
          onComplete={handleComplete}
        />
      </div>
    </div>
  );
}