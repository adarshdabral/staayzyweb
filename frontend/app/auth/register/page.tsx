"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/lib/store";
import api from "@/lib/api";
import { useToast } from "@/lib/hooks/use-toast";

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "tenant" as "tenant" | "owner",
    referralCode: "",
  });

  // Read role from query string on client mount (avoid using useSearchParams during prerender)
  useEffect(() => {
    try {
      const sp = new URLSearchParams(window.location.search);
      const role = sp.get("role") as "tenant" | "owner" | null;
      if (role) setFormData((f) => ({ ...f, role }));
    } catch (e) {
      // ignore
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post("/auth/register", formData);
      const { token, user } = response.data;

      setAuth(user, token);

      toast({
        title: "Registration successful",
        description: `Welcome to Staayzy, ${user.name}!`,
      });

      // Redirect based on role
      if (user.role === "owner") {
        router.push("/owner/dashboard");
      } else {
        router.push("/tenant/dashboard");
      }
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.response?.data?.message || "Registration failed",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xl">
              S
            </div>
            <span className="text-3xl font-bold text-primary">Staayzy</span>
          </div>
          <CardTitle className="text-2xl">Create an account</CardTitle>
          <CardDescription>Sign up to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1234567890"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">I want to</Label>
              <Select
                value={formData.role}
                onValueChange={(value: "tenant" | "owner") =>
                  setFormData({ ...formData, role: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tenant">Find a Room (Tenant)</SelectItem>
                  <SelectItem value="owner">List my Property (Owner)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="referralCode">Referral Code (Optional)</Label>
              <Input
                id="referralCode"
                type="text"
                placeholder="Enter referral code"
                value={formData.referralCode}
                onChange={(e) =>
                  setFormData({ ...formData, referralCode: e.target.value })
                }
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600">Already have an account? </span>
            <Button
              variant="link"
              onClick={() => router.push("/auth/login")}
              className="p-0"
            >
              Sign in
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


