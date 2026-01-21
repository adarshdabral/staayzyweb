"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Check, Star, Users, Shield, Award } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { useState } from "react";

export default function Home() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  // const { data: featuredProperties } = useQuery({
  //   queryKey: ["featured-properties"],
  //   queryFn: async () => {
  //     const response = await api.get("/properties?status=approved");
  //     return response.data.slice(0, 6);
  //   },
  // });
const { data: featuredProperties } = useQuery({
  queryKey: ["featured-properties"],
  queryFn: async () => {
    const response = await api.get("/properties?status=approved");
    return response.data.slice(0, 6);
  },
  enabled: typeof window !== "undefined", // 🔥 prevents early execution
});

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/tenant?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-8">
          <div className="inline-block bg-gray-100 rounded-full px-4 py-2 mb-6">
            <p className="text-sm text-gray-600">Trusted by 10,000+ users</p>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Find Your Perfect{" "}
            <span className="text-primary">Student Living Space</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Discover verified rooms, transparent pricing, and essential local services – all in one place.
          </p>

          {/* Search Bar */}
          <div className="max-w-3xl mx-auto mb-8">
            <div className="flex gap-4 bg-white rounded-lg shadow-lg p-2">
              <div className="flex-1 flex items-center gap-3 px-4">
                <Search className="h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Enter city, university or neighborhood..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="border-0 focus-visible:ring-0 text-lg"
                />
              </div>
              <Button onClick={handleSearch} size="lg" className="px-8">
                Search Rooms
              </Button>
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-3 justify-center mt-4 flex-wrap">
              <Button variant="outline" size="sm" className="rounded-full">
                <Users className="h-4 w-4 mr-2" />
                Near Campus
              </Button>
              <Button variant="default" size="sm" className="rounded-full">
                <Check className="h-4 w-4 mr-2" />
                Under ₹10,000
              </Button>
              <Button variant="outline" size="sm" className="rounded-full">
                Fully Furnished
              </Button>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-12">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">😊</span>
                  10,000+ Happy Tenants
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Check className="h-6 w-6 text-green-500" />
                  100% Verified Listings
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-6 w-6 text-yellow-500" />
                  4.8/5 Average Rating
                  <div className="flex gap-1">
                    {[1, 2, 3].map((i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                    ))}
                    {[1, 2].map((i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-500" />
                    ))}
                  </div>
                </CardTitle>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Rooms */}
      <section className="container mx-auto px-4 py-20 bg-white">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Featured Rooms</h2>
          <p className="text-gray-600">Handpicked accommodations for students</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProperties?.slice(0, 6).map((property: any) => (
            <Card key={property._id} className="overflow-hidden hover:shadow-lg transition">
              {property.images && property.images[0] && (
                <div className="h-48 bg-gray-200 relative">
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
                  <span className="text-2xl font-bold text-primary">
                    ₹{property.rooms?.[0]?.monthlyRent || "N/A"}
                  </span>
                  <div className="flex items-center gap-1">
                    <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                    <span className="font-semibold">5.0</span>
                  </div>
                </div>
                <Link href={`/properties/${property._id}`}>
                  <Button className="w-full">View Details</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/tenant">
            <Button variant="outline" size="lg">
              View All Rooms
            </Button>
          </Link>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">What Our Users Say</h2>
          <p className="text-gray-600">Real experiences from our community</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              name: "Sarah Johnson",
              role: "Student, MIT",
              content: "Staayzy made finding my room so easy! The verified listings gave me peace of mind.",
              rating: 5,
            },
            {
              name: "Rahul Kumar",
              role: "Student, Delhi University",
              content: "Great platform with transparent pricing. Found my perfect room within days!",
              rating: 5,
            },
            {
              name: "Priya Sharma",
              role: "Student, IIT",
              content: "Love the detailed property information. Made my decision much easier!",
              rating: 5,
            },
          ].map((testimonial, idx) => (
            <Card key={idx}>
              <CardHeader>
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                  ))}
                </div>
                <CardDescription className="text-base">{testimonial.content}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="font-semibold">{testimonial.name}</p>
                <p className="text-sm text-gray-500">{testimonial.role}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Services Coming Soon */}
      <section className="container mx-auto px-4 py-20 bg-gray-50">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Coming Soon</h2>
          <p className="text-gray-600">Additional services to enhance your experience</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <Card className="text-center">
            <CardHeader>
              <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🍽️</span>
              </div>
              <CardTitle>Mess Services</CardTitle>
              <CardDescription>
                Find nearby mess facilities and meal plans tailored for students
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🧺</span>
              </div>
              <CardTitle>Laundry Services</CardTitle>
              <CardDescription>
                Connect with reliable laundry services in your area
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>
    </div>
  );
}
