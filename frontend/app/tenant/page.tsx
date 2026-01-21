"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, MapPin, Bed, Users, Star, Heart } from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { useToast } from "@/lib/hooks/use-toast";

export default function TenantLandingPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    minRent: "",
    maxRent: "",
    distance: "",
    sharing: "",
  });

  const { data: properties, isLoading } = useQuery({
    queryKey: ["properties", filters],
    queryFn: async () => {
      const params = new URLSearchParams({ status: "approved" });
      if (filters.minRent) params.append("minRent", filters.minRent);
      if (filters.maxRent) params.append("maxRent", filters.maxRent);
      if (filters.distance) params.append("distance", filters.distance);
      
      const response = await api.get(`/properties?${params.toString()}`);
      return response.data;
    },
  });

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/tenant?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleAddToWishlist = async (propertyId: string) => {
    if (!isAuthenticated()) {
      router.push("/auth/login");
      return;
    }
    try {
      await api.post("/wishlist", { propertyId });
      toast({
        title: "Added to wishlist",
        description: "Property added to your wishlist",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to add to wishlist",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/10 to-purple-100 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">
              Find Your Perfect Student Living Space
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Search for verified rooms, transparent pricing, and essential local services
            </p>

            {/* Search Bar */}
            <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
              <div className="flex gap-4">
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
            </div>

            {/* Filters */}
            <div className="flex gap-3 justify-center flex-wrap">
              <Input
                type="number"
                placeholder="Min Rent (₹)"
                value={filters.minRent}
                onChange={(e) =>
                  setFilters({ ...filters, minRent: e.target.value })
                }
                className="max-w-32"
              />
              <Input
                type="number"
                placeholder="Max Rent (₹)"
                value={filters.maxRent}
                onChange={(e) =>
                  setFilters({ ...filters, maxRent: e.target.value })
                }
                className="max-w-32"
              />
              <Input
                type="number"
                placeholder="Max Distance (km)"
                value={filters.distance}
                onChange={(e) =>
                  setFilters({ ...filters, distance: e.target.value })
                }
                className="max-w-32"
              />
              <select
                value={filters.sharing}
                onChange={(e) =>
                  setFilters({ ...filters, sharing: e.target.value })
                }
                className="px-4 py-2 rounded-md border border-gray-300"
              >
                <option value="">All Types</option>
                <option value="single">Single</option>
                <option value="sharing">Sharing</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Rooms */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Available Rooms</h2>
          <Link href="/tenant/dashboard">
            <Button variant="outline">View All Rooms</Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="text-center py-12">Loading properties...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties?.map((property: any) => (
              <Card key={property._id} className="overflow-hidden hover:shadow-lg transition">
                {property.images && property.images[0] && (
                  <div className="h-48 bg-gray-200 relative">
                    <img
                      src={property.images[0]}
                      alt={property.name}
                      className="w-full h-full object-cover"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                      onClick={() => handleAddToWishlist(property._id)}
                    >
                      <Heart className="h-5 w-5" />
                    </Button>
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{property.name}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {property.nearestCollege} • {property.distanceFromCollege} km
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {property.rooms?.map((room: any) => (
                      <div key={room._id} className="border-t pt-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Bed className="h-4 w-4 text-gray-500" />
                            <span className="font-semibold capitalize">
                              {room.roomType}
                            </span>
                            {room.roomType === "sharing" && (
                              <span className="text-sm text-gray-500">
                                ({room.capacity} sharing)
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                            <span className="text-sm font-semibold">5.0</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-2xl font-bold text-primary">
                              ₹{room.monthlyRent}
                            </p>
                            <p className="text-sm text-gray-500">per month</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">
                              {room.availableCount > 0
                                ? `${room.availableCount} available`
                                : "Fully Booked"}
                            </p>
                          </div>
                        </div>
                        <Link href={`/properties/${property._id}`}>
                          <Button
                            className="w-full mt-4"
                            disabled={room.availableCount === 0}
                          >
                            {room.availableCount > 0 ? "View Details" : "Fully Booked"}
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Why Choose Staayzy */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Staayzy</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: "✓", title: "Verified Listings", desc: "100% verified properties" },
              { icon: "💰", title: "Transparent Pricing", desc: "No hidden charges" },
              { icon: "🏠", title: "Best Locations", desc: "Near top universities" },
            ].map((feature, idx) => (
              <Card key={idx} className="text-center">
                <CardHeader>
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}


