"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Building2,
  Package,
  Settings
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Business", href: "/business", icon: Building2 },
  { name: "Products", href: "/products", icon: Package },
  { name: "Settings", href: "/settings", icon: Settings },
];

interface BottomNavProps {
  className?: string;
}

export function BottomNav({ className }: BottomNavProps) {
  const pathname = usePathname();

  return (
    <nav className={cn("bottom-nav-fixed bg-background border-t border-border", className)}>
      <div className="grid grid-cols-4 h-full px-2 py-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center py-2 px-2 rounded-xl min-h-[40px] transition-all duration-200",
                isActive
                  ? "bg-primary shadow-lg"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted active:bg-primary/20"
              )}
            >
              <item.icon className={cn(
                "flex-shrink-0 transition-all duration-200",
                isActive ? "h-5 w-5" : "h-5 w-5"
              )} />
              <span className={cn(
                "text-xs mt-1 leading-tight font-medium transition-all duration-200",
                isActive ? "text-primary-foreground" : "text-muted-foreground"
              )}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
