"use client";

import { PartyPopper, ArrowRight } from "lucide-react";

interface CongratulationsStepProps {
  businessData: {
    name: string;
    businessType: string;
    country: string;
  };
}

const BUSINESS_TYPE_NAMES: Record<string, string> = {
  "agency": "Agency Services",
  "paid-groups": "Paid Groups",
  "software": "Software",
  "events": "Events",
  "coaching": "Coaching and Courses",
  "campaigns": "Paid Campaigns",
  "webinars": "Webinars",
  "tools": "Software Tools and Products",
};

const BUSINESS_TYPE_EARNINGS: Record<string, string> = {
  "agency": "$5K-50K/month",
  "paid-groups": "$1K-20K/month",
  "software": "$10K-100K/month",
  "events": "$2K-30K/event",
  "coaching": "$3K-25K/month",
  "campaigns": "$2K-40K/month",
  "webinars": "$1K-15K/webinar",
  "tools": "$5K-80K/month",
};

const NEXT_STEPS = [
  "Complete your business profile",
  "Set up your payment methods",
  "Start connecting with customers",
  "Launch your first service or product",
];

export function CongratulationsStep({ businessData }: CongratulationsStepProps) {
  const businessTypeName = BUSINESS_TYPE_NAMES[businessData.businessType] || "Business";
  const earningPotential = BUSINESS_TYPE_EARNINGS[businessData.businessType] || "";

  return (
    <div className="space-y-10 py-8">
      {/* Celebration Icon */}
      <div className="flex justify-center">
        <div className="w-24 h-24 bg-gradient-to-br from-red-400 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl">
          <PartyPopper className="w-12 h-12 text-white" />
        </div>
      </div>

      {/* Congratulations Message */}
      <div className="text-center space-y-3">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
          Congratulations!
        </h1>
        <p className="text-xl text-purple-600 dark:text-purple-400">
          Your business has been successfully created
        </p>
      </div>

      {/* Business Summary */}
      <div className="max-w-2xl mx-auto">
        <h3 className="text-xl font-semibold text-center mb-6 text-gray-900 dark:text-white">
          Your Business Summary
        </h3>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-300">Business Type:</span>
            <span className="font-semibold text-gray-900 dark:text-white">{businessTypeName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-300">Specialization:</span>
            <span className="font-semibold text-gray-900 dark:text-white">Exclusive Communities</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-300">Country:</span>
            <span className="font-semibold text-gray-900 dark:text-white">{businessData.country}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-300">Business Name:</span>
            <span className="font-semibold text-gray-900 dark:text-white">{businessData.name}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-300">Earning Potential:</span>
            <span className="font-semibold text-purple-600 dark:text-purple-400">{earningPotential}</span>
          </div>
        </div>
      </div>

      {/* What's Next */}
      <div className="max-w-2xl mx-auto">
        <h3 className="text-xl font-semibold text-center mb-6 text-gray-900 dark:text-white">
          What's next?
        </h3>
        <div className="space-y-3">
          {NEXT_STEPS.map((step, index) => (
            <div
              key={index}
              className="flex items-center gap-4 bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl"
            >
              <ArrowRight className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
              <span className="text-gray-700 dark:text-gray-200">{step}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
