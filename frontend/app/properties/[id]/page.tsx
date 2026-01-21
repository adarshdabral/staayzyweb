"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { useToast } from "@/lib/hooks/use-toast";
import { MapPin, Bed, Users, Star, Heart, Calendar, Shield, Check } from "lucide-react";
import Image from "next/image";

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  // Use `any` cast to avoid complex react-query generic types in this file
  const { data: rawData, isLoading } = (useQuery as any)({
    queryKey: ["property", params.id],
    queryFn: async () => {
      const response = await api.get(`/properties/${params.id}`);
      return response.data;
    },
    enabled: !!params.id,
    onError: (error: any) => {
      if (error?.response?.status === 403) {
        return;
      }
      console.error("Property fetch error:", error?.response?.data || error.message || error);
    },
  });

  // Normalize backend response: some errors return { available:false, property }
  const property: any = rawData && (rawData as any).available === false ? (rawData as any).property : rawData;

  const { data: reviews } = useQuery({
    queryKey: ["reviews", params.id],
    queryFn: async () => {
      const response = await api.get(`/reviews/property/${params.id}`);
      return response.data;
    },
    enabled: !!params.id,
  });

  const addToWishlistMutation = useMutation({
    mutationFn: async (propertyId: string) => {
      return api.post("/wishlist", { propertyId });
    },
    onSuccess: () => {
      toast({ title: "Added to wishlist", description: "Property added to your wishlist" });
      queryClient.invalidateQueries({ queryKey: ["tenant-wishlist"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to add to wishlist",
        variant: "destructive",
      });
    },
  });

  const createBookingMutation = useMutation({
    mutationFn: async (data: { propertyId: string; roomId: string; startDate: string }) => {
      return api.post("/bookings", data);
    },
    onSuccess: () => {
      toast({ title: "Booking created", description: "Your booking request has been submitted" });
      queryClient.invalidateQueries({ queryKey: ["tenant-bookings"] });
      router.push("/tenant/dashboard");
    },
    onError: (error: any) => {
      toast({
        title: "Booking failed",
        description: error.response?.data?.message || "Failed to create booking",
        variant: "destructive",
      });
    },
  });

  const handleBook = (roomId: string) => {
    // Prevent non-tenants from booking (extra server-side checks exist, but
    // enforce UX-level restrictions here as well).
    if (user?.role !== "tenant") {
      toast({ title: "Not allowed", description: "Only tenants can make bookings", variant: "destructive" });
      return;
    }

    if (!isAuthenticated()) {
      router.push("/auth/login");
      return;
    }

    if (!selectedDate) {
      toast({
        title: "Date required",
        description: "Please select a start date",
        variant: "destructive",
      });
      return;
    }

    createBookingMutation.mutate({
      propertyId: params.id as string,
      roomId,
      startDate: selectedDate,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading property details...</p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Property not found</p>
      </div>
    );
  }

  // Handle backend response shape for unavailable properties
  if (property && property.available === false) {
    const p = property.property; // actual property object returned by backend
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-2xl text-center">
          <h2 className="text-2xl font-bold mb-4">This property is currently unavailable</h2>
          <p className="text-gray-600 mb-4">{p?.name || "Details are not available"}</p>
          <p className="text-sm text-gray-500 mb-6">This listing is not currently approved or is temporarily unavailable.</p>
          <div className="flex justify-center gap-4">
            <Button onClick={() => router.back()}>Go Back</Button>
            <Button onClick={() => router.push("/")} variant="outline">Browse other properties</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Images Carousel */}
        <div className="mb-8">
          {property.images && property.images.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {property.images.map((image: string, idx: number) => (
                <div key={idx} className="h-64 bg-gray-200 rounded-lg overflow-hidden">
                  <img
                    src={image}
                    alt={`${property.name} - Image ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="h-96 bg-gray-200 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">No images available</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Property Header */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-4xl font-bold mb-2">{property.name}</h1>
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="h-5 w-5" />
                    <span>{property.nearestCollege}</span>
                    <span>•</span>
                    <span>{property.distanceFromCollege} km from college</span>
                  </div>
                </div>
                {user?.role === "tenant" && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      if (!isAuthenticated()) return router.push("/auth/login");
                      addToWishlistMutation.mutate(property._id);
                    }}
                  >
                    <Heart className="h-5 w-5" />
                  </Button>
                )}
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                  ))}
                </div>
                <span className="text-xl font-bold">5.0</span>
                <span className="text-gray-600">
                  ({reviews?.reviews?.length || 0} reviews)
                </span>
              </div>
            </div>

            {/* Rooms */}
            <Card>
              <CardHeader>
                <CardTitle>Available Rooms</CardTitle>
                <CardDescription>Select a room type to book</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {property.rooms?.map((room: any) => (
                  <div
                    key={room._id}
                    className="border rounded-lg p-4 space-y-4"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Bed className="h-5 w-5 text-gray-500" />
                          <h3 className="text-xl font-semibold capitalize">
                            {room.roomType} Room
                          </h3>
                          {room.roomType === "sharing" && (
                            <span className="text-sm text-gray-600">
                              ({room.capacity} sharing capacity)
                            </span>
                          )}
                        </div>
                        <div className="space-y-2">
                          <div>
                            <p className="text-2xl font-bold text-primary">
                              ₹{room.monthlyRent}
                            </p>
                            <p className="text-sm text-gray-600">per month</p>
                          </div>
                          <div>
                            <p className="text-lg font-semibold">
                              Security Deposit: ₹{room.securityDeposit}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">
                              Available: {room.availableCount} of {room.capacity}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {room.rules && room.rules.length > 0 && (
                      <div>
                        <p className="text-sm font-semibold mb-2">Room Rules:</p>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                          {room.rules.map((rule: string, idx: number) => (
                            <li key={idx}>{rule}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {room.availableCount > 0 ? (
                      // Booking UI is strictly tenant-only. Render controls only when
                      // the current user has role === "tenant". Owners/admins MUST
                      // never see booking CTAs.
                      user?.role === "tenant" ? (
                        <div className="space-y-4 pt-4 border-t">
                          <div>
                            <label className="text-sm font-medium mb-2 block">
                              Start Date
                            </label>
                            <input
                              type="date"
                              value={selectedDate}
                              onChange={(e) => setSelectedDate(e.target.value)}
                              min={new Date().toISOString().split("T")[0]}
                              className="w-full px-3 py-2 border rounded-md"
                              required
                            />
                          </div>
                          <Button
                            className="w-full"
                            onClick={() => handleBook(room._id)}
                            disabled={createBookingMutation.isPending}
                          >
                            {createBookingMutation.isPending
                              ? "Booking..."
                              : "Book Now"}
                          </Button>
                        </div>
                      ) : (
                        <div className="pt-4 border-t">
                          <p className="text-sm text-gray-600">Booking is available for tenants only.</p>
                        </div>
                      )
                    ) : (
                      <div className="pt-4 border-t">
                        <Button className="w-full" disabled>
                          Fully Booked
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Facilities */}
            {property.facilities && property.facilities.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Facilities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {property.facilities.map((facility: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{facility}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reviews */}
            <Card>
              <CardHeader>
                <CardTitle>Reviews</CardTitle>
                <CardDescription>
                  Average Rating: {reviews?.averageRating?.toFixed(1) || "5.0"} / 5.0
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {reviews?.reviews?.length > 0 ? (
                  reviews.reviews.map((review: any) => (
                    <div key={review._id} className="border-b pb-4 last:border-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="font-semibold">
                              {review.tenant?.name?.charAt(0) || "U"}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold">{review.tenant?.name || "Anonymous"}</p>
                            <p className="text-sm text-gray-600">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(review.rating)].map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600">No reviews yet</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Property Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Nearest College</p>
                  <p className="font-semibold">{property.nearestCollege}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Distance</p>
                  <p className="font-semibold">{property.distanceFromCollege} km</p>
                </div>
                {property.owner && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Owner</p>
                    <p className="font-semibold">{property.owner.name}</p>
                    <p className="text-sm text-gray-600">{property.owner.email}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}


