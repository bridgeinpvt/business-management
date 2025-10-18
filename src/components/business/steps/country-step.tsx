"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const COUNTRIES = [
  "India",
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "Singapore",
  "United Arab Emirates",
  "Other",
];

interface CountryStepProps {
  country: string;
  onChange: (country: string) => void;
}

export function CountryStep({ country, onChange }: CountryStepProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-8">
      {/* Title */}
      <div className="text-center space-y-3 max-w-2xl">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
          Where is your business located?
        </h2>
        <p className="text-gray-600 dark:text-gray-300 text-lg">
          This helps us provide region-specific support and opportunities.
        </p>
      </div>

      {/* Country Select */}
      <div className="w-full max-w-md space-y-3">
        <Label htmlFor="country" className="text-base">
          Select your country
        </Label>
        <Select value={country} onValueChange={onChange}>
          <SelectTrigger className="h-14 text-lg px-6 rounded-xl">
            <SelectValue placeholder="Choose your country..." />
          </SelectTrigger>
          <SelectContent>
            {COUNTRIES.map((countryOption) => (
              <SelectItem key={countryOption} value={countryOption}>
                {countryOption}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
