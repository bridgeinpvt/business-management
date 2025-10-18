"use client";

import { Building2, Users, Laptop, Calendar, GraduationCap, Megaphone, Video, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

const BUSINESS_TYPES = [
  {
    id: "agency",
    icon: Building2,
    title: "Agency Services",
    description: "Offer professional services to clients",
    priceRange: "$5K-50K/month",
  },
  {
    id: "paid-groups",
    icon: Users,
    title: "Paid Groups",
    description: "Create exclusive communities and memberships",
    priceRange: "$1K-20K/month",
  },
  {
    id: "software",
    icon: Laptop,
    title: "Software",
    description: "Develop and sell software solutions",
    priceRange: "$10K-100K/month",
  },
  {
    id: "events",
    icon: Calendar,
    title: "Events",
    description: "Organize and monetize events",
    priceRange: "$2K-30K/event",
  },
  {
    id: "coaching",
    icon: GraduationCap,
    title: "Coaching and Courses",
    description: "Share knowledge and train others",
    priceRange: "$3K-25K/month",
  },
  {
    id: "campaigns",
    icon: Megaphone,
    title: "Paid Campaigns",
    description: "Run marketing campaigns for businesses",
    priceRange: "$2K-40K/month",
  },
  {
    id: "webinars",
    icon: Video,
    title: "Webinars",
    description: "Host educational and promotional webinars",
    priceRange: "$1K-15K/webinar",
  },
  {
    id: "tools",
    icon: Wrench,
    title: "Software Tools and Products",
    description: "Create useful tools and digital products",
    priceRange: "$5K-80K/month",
  },
];

interface BusinessTypeStepProps {
  selectedType?: string;
  onSelect: (type: string) => void;
}

export function BusinessTypeStep({ selectedType, onSelect }: BusinessTypeStepProps) {
  return (
    <div className="space-y-8 py-6">
      {/* Title */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          What your business is about
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Choose the category that best describes your business model
        </p>
      </div>

      {/* Business Type Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
        {BUSINESS_TYPES.map((type) => {
          const Icon = type.icon;
          const isSelected = selectedType === type.id;

          return (
            <button
              key={type.id}
              onClick={() => onSelect(type.id)}
              className={cn(
                "relative p-6 rounded-xl border-2 text-left transition-all hover:shadow-lg",
                isSelected
                  ? "border-purple-600 bg-purple-50 dark:bg-purple-900/20 shadow-lg"
                  : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-purple-300"
              )}
            >
              {/* Selection Indicator */}
              {isSelected && (
                <div className="absolute top-3 right-3 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}

              {/* Icon */}
              <div className={cn(
                "w-12 h-12 rounded-lg flex items-center justify-center mb-4",
                isSelected ? "bg-purple-600" : "bg-purple-100 dark:bg-purple-900/30"
              )}>
                <Icon className={cn(
                  "w-6 h-6",
                  isSelected ? "text-white" : "text-purple-600 dark:text-purple-400"
                )} />
              </div>

              {/* Content */}
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {type.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {type.description}
                </p>
                <div className="pt-2">
                  <span className="inline-block px-3 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-xs font-medium rounded-full">
                    {type.priceRange}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
