"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BusinessCreationWizard } from "@/components/business/business-creation-wizard";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

export default function CreateBusinessPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const progress = ((currentStep - 1) / 6) * 100; // 7 steps, but step 1 is welcome (0%)

  const handleComplete = () => {
    router.push("/dashboard");
  };

  const handleBack = () => {
    if (currentStep > 1 && currentStep < 7) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleContinue = async () => {
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
    } else if (currentStep === 6) {
      // Submit the form (call wizard's submit function)
      setIsSubmitting(true);
      try {
        if (typeof window !== 'undefined' && (window as any)._submitBusiness) {
          await (window as any)._submitBusiness();
          // Success - wizard will handle setting step to 7
        }
      } catch (error) {
        // Error handled by wizard
      } finally {
        setIsSubmitting(false);
      }
    } else if (currentStep === 7) {
      // Launch business - go to dashboard
      handleComplete();
    }
  };

  const canContinue = () => {
    // Step 1 has its own continue button
    if (currentStep === 1) return false;

    // All other steps can continue
    return true;
  };

  const getContinueLabel = () => {
    if (currentStep === 6) return isSubmitting ? "Creating..." : "Create Business";
    if (currentStep === 7) return "Launch My Business";
    return "Continue";
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Progress Bar - Fixed at top */}
      {currentStep > 1 && currentStep < 7 && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-950 border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="max-w-3xl mx-auto space-y-2">
              <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-300">
                <span>Step {currentStep - 1} of 6</span>
                <span className="text-purple-600 dark:text-purple-400 font-medium">
                  {Math.round(progress)}% Complete
                </span>
              </div>
              <Progress
                value={progress}
                className="h-2 bg-gray-200 dark:bg-gray-800"
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={cn(
        "container mx-auto px-4",
        currentStep > 1 && currentStep < 7 ? "pt-24 pb-32" : "py-12"
      )}>
        <div className="max-w-5xl mx-auto">
          <BusinessCreationWizard
            currentStep={currentStep}
            onStepChange={setCurrentStep}
            onComplete={handleComplete}
          />
        </div>
      </div>

      {/* Navigation Buttons - Fixed at bottom */}
      {currentStep > 1 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-950 border-t shadow-lg">
          <div className="container mx-auto px-4 py-6">
            <div className="max-w-3xl mx-auto flex justify-between items-center gap-4">
              {/* Back Button */}
              {currentStep > 1 && currentStep < 7 && (
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="px-8 h-12 rounded-xl"
                >
                  Back
                </Button>
              )}

              {/* Spacer */}
              {currentStep === 7 && <div />}

              {/* Continue/Submit Button */}
              {canContinue() && (
                <Button
                  onClick={handleContinue}
                  disabled={isSubmitting}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-8 h-12 rounded-xl ml-auto"
                >
                  {getContinueLabel()}
                </Button>
              )}

              {/* Complete Setup Later - Only on step 7 */}
              {currentStep === 7 && (
                <Button
                  variant="ghost"
                  onClick={() => router.push("/dashboard")}
                  className="text-gray-600 dark:text-gray-300"
                >
                  Complete Setup Later
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
