"use client";

import { Check } from "lucide-react";

const BENEFITS = [
  "Start earning immediately after setup",
  "No upfront costs or hidden fees",
  "24/7 support and guidance",
  "Access to proven business models",
  "Connect with customers worldwide",
];

const STATS = [
  { value: "50,000+", label: "Active Businesses" },
  { value: "$2M+", label: "Monthly Earnings" },
  { value: "150+", label: "Countries" },
];

export function BenefitsStep() {
  return (
    <div className="space-y-12 py-8">
      {/* Title */}
      <div className="text-center space-y-3">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
          Set your business and earn from day 1
        </h2>
        <p className="text-gray-600 dark:text-gray-300 text-lg">
          Join thousands of successful entrepreneurs
        </p>
      </div>

      {/* Benefits List */}
      <div className="max-w-md mx-auto">
        <h3 className="text-xl font-semibold text-center mb-6 text-gray-900 dark:text-white">
          Why start with us?
        </h3>
        <div className="space-y-4">
          {BENEFITS.map((benefit, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
              <span className="text-gray-700 dark:text-gray-200">{benefit}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {STATS.map((stat, index) => (
          <div
            key={index}
            className="bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-6 text-center"
          >
            <div className="text-3xl md:text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">
              {stat.value}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
