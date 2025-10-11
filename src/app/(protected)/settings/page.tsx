"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User, Bell, Lock, Palette, Moon, Sun, Monitor } from "lucide-react";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { useTheme } from "next-themes";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("profile");

  // Get current user
  const { data: currentUser, isLoading, refetch } = api.user.getCurrentUser.useQuery();

  // Update profile mutation
  const updateProfileMutation = api.user.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("Profile updated successfully!");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update profile");
    },
  });

  const handleProfileSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      username: formData.get("username") as string || undefined,
      bio: formData.get("bio") as string || undefined,
      phone: formData.get("phone") as string || undefined,
    };

    updateProfileMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileSubmit} className="space-y-6">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={currentUser?.image || undefined} />
                    <AvatarFallback className="text-2xl">
                      {currentUser?.name?.[0] || currentUser?.email?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{currentUser?.name || "User"}</h3>
                    <p className="text-sm text-muted-foreground">{currentUser?.email}</p>
                    <Button type="button" variant="outline" size="sm" className="mt-2" disabled>
                      Change Photo
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      defaultValue={currentUser?.name || ""}
                      placeholder="John Doe"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      name="username"
                      defaultValue={currentUser?.username || ""}
                      placeholder="johndoe"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      defaultValue={currentUser?.email || ""}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      defaultValue={currentUser?.phone || ""}
                      placeholder="+91 1234567890"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Input
                      id="bio"
                      name="bio"
                      defaultValue={currentUser?.bio || ""}
                      placeholder="Tell us about yourself"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={updateProfileMutation.isPending}>
                    {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>View your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm font-medium">Account Status</span>
                <span className="text-sm text-green-600 font-semibold">Active</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm font-medium">Member Since</span>
                <span className="text-sm text-muted-foreground">
                  {currentUser?.createdAt ? new Date(currentUser.createdAt).toLocaleDateString() : "N/A"}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm font-medium">User ID</span>
                <span className="text-sm text-muted-foreground font-mono">{currentUser?.id}</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Theme</CardTitle>
              <CardDescription>Choose your preferred theme</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setTheme("light")}
                  className={`flex flex-col items-center space-y-2 p-4 rounded-lg border-2 transition-all ${
                    theme === "light" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                  }`}
                >
                  <Sun className="h-8 w-8" />
                  <span className="font-medium">Light</span>
                </button>

                <button
                  onClick={() => setTheme("dark")}
                  className={`flex flex-col items-center space-y-2 p-4 rounded-lg border-2 transition-all ${
                    theme === "dark" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                  }`}
                >
                  <Moon className="h-8 w-8" />
                  <span className="font-medium">Dark</span>
                </button>

                <button
                  onClick={() => setTheme("system")}
                  className={`flex flex-col items-center space-y-2 p-4 rounded-lg border-2 transition-all ${
                    theme === "system" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                  }`}
                >
                  <Monitor className="h-8 w-8" />
                  <span className="font-medium">System</span>
                </button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Manage how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <h4 className="font-medium">Order Notifications</h4>
                  <p className="text-sm text-muted-foreground">Get notified when you receive new orders</p>
                </div>
                <Button variant="outline" size="sm" disabled>
                  Configure
                </Button>
              </div>

              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <h4 className="font-medium">Product Updates</h4>
                  <p className="text-sm text-muted-foreground">Notifications about your products</p>
                </div>
                <Button variant="outline" size="sm" disabled>
                  Configure
                </Button>
              </div>

              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <h4 className="font-medium">Customer Messages</h4>
                  <p className="text-sm text-muted-foreground">Get notified of customer inquiries</p>
                </div>
                <Button variant="outline" size="sm" disabled>
                  Configure
                </Button>
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <h4 className="font-medium">Email Notifications</h4>
                  <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                </div>
                <Button variant="outline" size="sm" disabled>
                  Configure
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">
                Notification preferences are coming soon. All notifications are currently enabled by default.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
