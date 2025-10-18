"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BusinessNameStepProps {
  name: string;
  onChange: (name: string) => void;
}

export function BusinessNameStep({ name, onChange }: BusinessNameStepProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-8">
      {/* Title */}
      <div className="text-center space-y-3 max-w-2xl">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
          What's your business name?
        </h2>
        <p className="text-gray-600 dark:text-gray-300 text-lg">
          Choose a name that represents your brand and resonates with your customers
        </p>
      </div>

      {/* Input Field */}
      <div className="w-full max-w-md space-y-3">
        <Label htmlFor="business-name" className="text-base">
          Business Name
        </Label>
        <Input
          id="business-name"
          type="text"
          placeholder="Enter your business name..."
          value={name}
          onChange={(e) => onChange(e.target.value)}
          className="h-14 text-lg px-6 rounded-xl"
          autoFocus
        />
        {name && name.length < 2 && (
          <p className="text-sm text-red-500">Business name must be at least 2 characters</p>
        )}
      </div>

      {/* Tip */}
      <div className="max-w-md bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
        <p className="text-sm text-blue-700 dark:text-blue-300">
          💡 <strong>Tip:</strong> Pick a memorable name that's easy to spell and reflects what you do
        </p>
      </div>
    </div>
  );
}
