"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Shield, Users, CheckCircle, LayoutDashboard, Clock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import api from "@/lib/api";

export default function Home() {
  const router = useRouter();

  // Redirect logged-in owners directly to dashboard
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const res = await api.get("/auth/me");
        const role = res?.data?.role || res?.data?.user?.role;
        if (!mounted) return;
        if (role === "owner") {
          router.replace("/owner");
        }
      } catch {
        // Not logged in → stay on landing
      }
    })();

    return () => {
      mounted = false;
    };
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* HERO SECTION */}
      <section className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          List Your Property.
          <br />
          <span className="text-primary">Reach Genuine Student Tenants.</span>
        </h1>

        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
          Staayzy helps property owners list rooms and PGs, manage availability,
          and connect directly with students looking for verified accommodation
          near colleges.
        </p>

        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/auth/register">
  <Button size="lg" className="px-10">
    List Your Property
  </Button>
</Link>
          <Link href="#how-it-works">
            <Button size="lg" variant="outline">
              See How It Works
            </Button>
          </Link>
        </div>
      </section>

      {/* WHY LIST ON STAAYZY */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-bold mb-4">
            Built for Property Owners
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Simple tools, clear workflows, and full control over your listings —
            without brokers or unnecessary complexity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <Users className="h-8 w-8 mx-auto text-primary mb-3" />
              <CardTitle>Direct Student Reach</CardTitle>
              <CardDescription>
                Your property is visible to students actively searching for rooms
                near their colleges.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Shield className="h-8 w-8 mx-auto text-primary mb-3" />
              <CardTitle>Verified Platform</CardTitle>
              <CardDescription>
                Role-based access ensures owners and tenants interact securely
                and transparently.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <LayoutDashboard className="h-8 w-8 mx-auto text-primary mb-3" />
              <CardTitle>Owner Dashboard</CardTitle>
              <CardDescription>
                Manage properties, rooms, pricing, and availability from one
                place.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section
        id="how-it-works"
        className="container mx-auto px-4 py-20 bg-gray-50"
      >
        <div className="text-center mb-14">
          <h2 className="text-4xl font-bold mb-4">
            How Listing Works
          </h2>
          <p className="text-gray-600">
            A straightforward process designed for busy property owners
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>1. Create Owner Account</CardTitle>
              <CardDescription>
                Sign up as a property owner and complete basic verification.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Add Property & Rooms</CardTitle>
              <CardDescription>
                Upload photos, set rent, define room details, and mark
                availability.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Manage Bookings</CardTitle>
              <CardDescription>
                Receive booking requests and accept or reject them from your
                dashboard.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* WHAT YOU CONTROL */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-bold mb-4">
            You Stay in Control
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Staayzy does not interfere with your pricing or decisions — you
            decide what works best for your property.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <Card>
            <CardHeader>
              <CheckCircle className="h-6 w-6 text-primary mb-2" />
              <CardTitle>Set Your Own Rent</CardTitle>
              <CardDescription>
                No fixed pricing or forced discounts.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CheckCircle className="h-6 w-6 text-primary mb-2" />
              <CardTitle>Approve Tenants</CardTitle>
              <CardDescription>
                Accept or reject booking requests at your discretion.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CheckCircle className="h-6 w-6 text-primary mb-2" />
              <CardTitle>Manage Availability</CardTitle>
              <CardDescription>
                Mark rooms as booked or available anytime.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Clock className="h-6 w-6 text-primary mb-2" />
              <CardTitle>Save Time</CardTitle>
              <CardDescription>
                Reduce repeated calls and site visits with clear listings.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24 bg-primary text-white text-center">
        <h2 className="text-4xl font-bold mb-4">
          Start Listing Your Property Today
        </h2>
        <p className="text-lg mb-10 max-w-2xl mx-auto">
          Join Staayzy to showcase your property to students actively searching
          for accommodation near their campus.
        </p>

        <Link href="/auth/register">
          <Button size="lg" variant="secondary" className="px-10">
            Get Started
          </Button>
        </Link>
      </section>
    </div>
  );
}