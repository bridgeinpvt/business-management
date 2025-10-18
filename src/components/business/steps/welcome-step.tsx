"use client";

import { Button } from "@/components/ui/button";
import { Rocket } from "lucide-react";

interface WelcomeStepProps {
  onContinue: () => void;
}

export function WelcomeStep({ onContinue }: WelcomeStepProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] text-center space-y-8">
      {/* Rocket Image/Icon */}
      <div className="relative">
        <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl">
          <Rocket className="w-16 h-16 text-white" />
        </div>
      </div>

      {/* Heading */}
      <div className="space-y-4 max-w-2xl">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
          Create your business
        </h1>
        <p className="text-xl text-purple-600 dark:text-purple-400 font-medium">
          Start your entrepreneurial journey today
        </p>
        <p className="text-base text-gray-600 dark:text-gray-300 max-w-xl mx-auto">
          Build your dream business and start earning from day one with our comprehensive platform.
        </p>
      </div>

      {/* Get Started Button */}
      <Button
        onClick={onContinue}
        size="lg"
        className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all"
      >
        Get Started
      </Button>
    </div>
  );
}
