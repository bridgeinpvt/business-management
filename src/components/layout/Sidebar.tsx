"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { signOut } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Package,
  CreditCard,
  Link2,
  ExternalLink,
  Settings,
  LogOut,
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/trpc/react";

const mainNavigation = [
  { name: "Home", href: "/dashboard", icon: LayoutDashboard },
  { name: "Products", href: "/products", icon: Package },
  { name: "Users", href: "/customers", icon: Users },
  { name: "Checkout Links", href: "/checkout-links", icon: ExternalLink },
  { name: "Payments", href: "/payments", icon: CreditCard },
  { name: "Tracking Links", href: "/tracking-links", icon: Link2 },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useAuth();
  const { data: currentUser } = api.user.getCurrentUser.useQuery(
    undefined,
    { enabled: !!session?.user?.id }
  );

  // Get user's first business
  const { data: businesses } = api.business.getMyBusinesses.useQuery(
    undefined,
    { enabled: !!session?.user?.id }
  );

  const currentBusiness = businesses?.[0];

  return (
    <aside
      className={cn(
        "fixed left-0 top-16 h-[calc(100vh-4rem)] bg-background border-r border-border flex flex-col z-40 w-64",
        className
      )}
    >
      {/* Business Info - Top of Sidebar */}
      {currentBusiness && (
        <div className="p-4 border-b border-border">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10 rounded-lg">
              <AvatarImage src={currentBusiness.logoUrl || undefined} />
              <AvatarFallback className="text-sm rounded-lg bg-purple-100 text-purple-700">
                {currentBusiness.name[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">
                {currentBusiness.name}
              </p>
              <Badge
                variant="secondary"
                className="mt-1 bg-purple-100 text-purple-700 hover:bg-purple-100 text-xs"
              >
                Pro Plan
              </Badge>
            </div>
          </div>
        </div>
      )}

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto p-4">
        <nav className="space-y-1">
          {mainNavigation.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
                  isActive
                    ? "bg-purple-600 text-white"
                    : "text-muted-foreground hover:text-foreground hover:bg-purple-50"
                )}
              >
                <item.icon className="h-5 w-5 mr-3" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section - Settings & User */}
      <div className="border-t border-border">
        {/* Settings Link */}
        <div className="p-4 pb-2">
          <Link
            href="/settings"
            className={cn(
              "flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
              pathname === "/settings"
                ? "bg-purple-600 text-white"
                : "text-muted-foreground hover:text-foreground hover:bg-purple-50"
            )}
          >
            <Settings className="h-5 w-5 mr-3" />
            <span>Settings</span>
          </Link>
        </div>

        {/* User Profile */}
        {session?.user && (
          <div className="p-4 pt-2">
            <div className="flex items-center space-x-3 p-2 rounded-lg bg-muted/50">
              <Avatar className="h-8 w-8">
                <AvatarImage src={currentUser?.image || session.user.image || undefined} />
                <AvatarFallback className="text-xs">
                  {currentUser?.name?.[0] || session.user.name?.[0] || session.user.email?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {currentUser?.name || session.user.name || session.user.email}
                </p>
                {currentUser?.username && (
                  <p className="text-xs text-muted-foreground truncate">
                    @{currentUser.username}
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut()}
                className="h-8 w-8 p-0 hover:bg-purple-100 hover:text-purple-700"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
