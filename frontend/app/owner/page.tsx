"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { Check, Home, TrendingUp, Shield, Users, DollarSign, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function OwnerLandingPage() {
  const router = useRouter();

  const { token } = useAuthStore();
  const [authorized, setAuthorized] = useState<boolean>(false);
  const [checking, setChecking] = useState<boolean>(true);

  // Ensure only owners can access this page. If not owner, redirect to public landing.
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get("/auth/me");
        const role = res?.data?.role || res?.data?.user?.role;
        if (!mounted) return;
        if (role === "owner") {
          setAuthorized(true);
        } else {
          router.replace("/");
        }
      } catch (err) {
        // not authenticated — redirect to public landing
        if (mounted) router.replace("/");
      } finally {
        if (mounted) setChecking(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [router]);

  const { data: properties } = useQuery({
    queryKey: ["owner-properties"],
    enabled: !!token,
    queryFn: async () => {
      const response = await api.get("/properties?owner=me");
      return response.data;
    },
  });

  if (checking) return <div className="p-8">Checking permissions...</div>;

  if (!authorized) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/10 to-purple-100 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">List Your Property on Staayzy</h1>
            <p className="text-xl text-gray-600 mb-8">
              Reach thousands of students looking for accommodation. Get verified listings, transparent pricing, and manage bookings all in one place.
            </p>
            <Link href="/owner/properties/new">
              <Button size="lg" className="px-8">
                List Your Property
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Your Properties */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Your Properties</h2>
          <Link href="/owner/properties/new">
            <Button>Add New Property</Button>
          </Link>
        </div>

        {properties?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property: any) => (
              <Card key={property._id} className="overflow-hidden hover:shadow-lg transition">
                {property.images && property.images[0] && (
                  <div className="h-48 bg-gray-200">
                    <img
                      src={property.images[0]}
                      alt={property.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{property.name}</CardTitle>
                  <CardDescription>
                    {property.nearestCollege} • {property.distanceFromCollege} km
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        property.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : property.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {property.status.toUpperCase()}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push(`/owner/dashboard?propertyId=${property._id}`)}
                  >
                    Manage Property
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Home className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 mb-4">No properties listed yet</p>
              <Link href="/owner/properties/new">
                <Button>List Your First Property</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Benefits Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Benefits of Listing on Staayzy</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Users className="h-12 w-12 text-primary" />,
                title: "Reach More Students",
                desc: "Connect with thousands of students actively looking for accommodation",
              },
              {
                icon: <DollarSign className="h-12 w-12 text-primary" />,
                title: "Transparent Pricing",
                desc: "Set fair prices and get paid on time with our secure payment system",
              },
              {
                icon: <Shield className="h-12 w-12 text-primary" />,
                title: "Verified Tenants",
                desc: "All tenants are verified to ensure a safe and reliable rental experience",
              },
            ].map((benefit, idx) => (
              <Card key={idx} className="text-center">
                <CardHeader>
                  <div className="flex justify-center mb-4">{benefit.icon}</div>
                  <CardTitle>{benefit.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{benefit.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Property Section */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <TrendingUp className="h-16 w-16 text-primary mx-auto mb-4" />
              <CardTitle className="text-3xl">Feature Your Property</CardTitle>
              <CardDescription className="text-lg">
                Get your property highlighted and reach more students (Paid feature - Coming Soon)
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button variant="outline" disabled>
                Coming Soon
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How to Add Property */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">How to Add Your Property</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
          {[
            { step: "1", title: "Sign Up", desc: "Create your owner account" },
            { step: "2", title: "Add Property", desc: "Fill in property details" },
            { step: "3", title: "Add Rooms", desc: "Define room types and pricing" },
            { step: "4", title: "Get Approved", desc: "Wait for admin approval" },
          ].map((item, idx) => (
            <Card key={idx} className="text-center">
              <CardHeader>
                <div className="h-12 w-12 rounded-full bg-primary text-white flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  {item.step}
                </div>
                <CardTitle>{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="text-center mt-12">
          <Link href="/owner/properties/new">
            <Button size="lg" className="px-8">
              Get Started <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}


