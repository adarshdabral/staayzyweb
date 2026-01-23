"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/lib/store";
import api from "@/lib/api";
import { useToast } from "@/lib/hooks/use-toast";

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  try {
  const response = await api.post("/auth/login", formData);
  const { token, user } = response.data;

    // 🔥 1️⃣ PERSIST AUTH (THIS WAS MISSING)
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));

    // 🔥 2️⃣ UPDATE IN-MEMORY STATE
    setAuth(user, token);

    // Redirect based on role: admin -> admin dashboard, owner -> owner area, others -> main site
    if (user.role === "admin") {
      router.push("/admin/dashboard");
    } else if (user.role === "owner") {
      router.push("/owner");
    } else {
      router.push("/");
    }


    toast({
      title: "Login successful",
      description: `Welcome back, ${user.name}!`,
    });

  // Redirect handled above
  } catch (error: any) {
    toast({
      title: "Login failed",
      description: error.response?.data?.message || "Invalid credentials",
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
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600">Don't have an account? </span>
            <Button
              variant="link"
              onClick={() => router.push("/auth/register")}
              className="p-0"
            >
              Sign up
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


