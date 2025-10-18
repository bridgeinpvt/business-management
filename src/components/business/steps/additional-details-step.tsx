"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface AdditionalDetailsStepProps {
  description: string;
  contactEmail: string;
  contactPhone: string;
  onDescriptionChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
}

export function AdditionalDetailsStep({
  description,
  contactEmail,
  contactPhone,
  onDescriptionChange,
  onEmailChange,
  onPhoneChange,
}: AdditionalDetailsStepProps) {
  return (
    <div className="space-y-8 py-6 max-w-2xl mx-auto">
      {/* Title */}
      <div className="text-center space-y-3">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          Tell us more about your business
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          These details are optional but help customers learn more about you
        </p>
      </div>

      {/* Form Fields */}
      <div className="space-y-6">
        {/* Business Description */}
        <div className="space-y-2">
          <Label htmlFor="description" className="text-base">
            Business Description <span className="text-gray-400">(Optional)</span>
          </Label>
          <Textarea
            id="description"
            placeholder="Describe what makes your business unique..."
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            className="min-h-[120px] rounded-xl"
          />
        </div>

        {/* Contact Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-base">
            Contact Email <span className="text-gray-400">(Optional)</span>
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="contact@yourbusiness.com"
            value={contactEmail}
            onChange={(e) => onEmailChange(e.target.value)}
            className="h-12 rounded-xl"
          />
        </div>

        {/* Contact Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-base">
            Contact Phone <span className="text-gray-400">(Optional)</span>
          </Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+1 (555) 123-4567"
            value={contactPhone}
            onChange={(e) => onPhoneChange(e.target.value)}
            className="h-12 rounded-xl"
          />
        </div>
      </div>

      {/* Skip Notice */}
      <div className="text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          You can always add or update these details later in your business settings
        </p>
      </div>
    </div>
  );
}
