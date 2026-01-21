"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { useState } from "react";
import { useToast } from "@/lib/hooks/use-toast";
import { Bed, Calendar, MessageSquare, Star, Heart, AlertCircle, Copy } from "lucide-react";
import Link from "next/link";

export default function TenantDashboard() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [review, setReview] = useState({ propertyId: "", rating: 5, comment: "" });
  const [complaint, setComplaint] = useState({ propertyId: "", subject: "", description: "" });

  const { data: bookings } = useQuery({
    queryKey: ["tenant-bookings"],
    queryFn: async () => {
      const response = await api.get("/bookings");
      return response.data;
    },
    enabled: !!user,
  });

  const { data: wishlist } = useQuery({
    queryKey: ["tenant-wishlist"],
    queryFn: async () => {
      const response = await api.get("/wishlist");
      return response.data;
    },
    enabled: !!user,
  });

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/reviews", review);
      toast({
        title: "Review added",
        description: "Thank you for your feedback!",
      });
      setReview({ propertyId: "", rating: 5, comment: "" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to add review",
        variant: "destructive",
      });
    }
  };

  const handleRaiseComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/complaints", complaint);
      toast({
        title: "Complaint filed",
        description: "We'll look into this issue",
      });
      setComplaint({ propertyId: "", subject: "", description: "" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to file complaint",
        variant: "destructive",
      });
    }
  };

  const copyReferralCode = () => {
    if (user?.referralCode) {
      navigator.clipboard.writeText(user.referralCode);
      toast({
        title: "Copied!",
        description: "Referral code copied to clipboard",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Welcome, {user?.name}!</h1>
          <p className="text-gray-600">Manage your bookings and preferences</p>
        </div>

        <Tabs defaultValue="bookings" className="space-y-6">
          <TabsList>
            <TabsTrigger value="bookings">Current Bookings</TabsTrigger>
            <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
            <TabsTrigger value="reviews">Add Review</TabsTrigger>
            <TabsTrigger value="complaints">Raise Complaint</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="bookings" className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">Current Booking Status</h2>
            {bookings?.length > 0 ? (
              <div className="grid gap-4">
                {bookings.map((booking: any) => (
                  <Card key={booking._id}>
                    <CardHeader>
                      <CardTitle>{booking.property?.name || "Property"}</CardTitle>
                      <CardDescription>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="flex items-center gap-2">
                            <Bed className="h-4 w-4" />
                            {booking.room?.roomType || "Room"}
                          </span>
                          <span className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {new Date(booking.startDate).toLocaleDateString()}
                          </span>
                        </div>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Monthly Rent</p>
                          <p className="text-xl font-bold text-primary">₹{booking.rent}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Security Deposit</p>
                          <p className="text-xl font-bold">₹{booking.securityDeposit}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            booking.status === "approved"
                              ? "bg-green-100 text-green-800"
                              : booking.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {booking.status.toUpperCase()}
                        </span>
                        <Link href={`/properties/${booking.property?._id || booking.property}`}>
                          <Button variant="outline">View Details</Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-gray-600 mb-4">No bookings yet</p>
                  <Link href="/tenant">
                    <Button>Browse Rooms</Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="wishlist" className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">My Wishlist</h2>
            {wishlist?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {wishlist.map((item: any) => (
                  <Card key={item._id} className="overflow-hidden">
                    {item.property?.images?.[0] && (
                      <div className="h-48 bg-gray-200">
                        <img
                          src={item.property.images[0]}
                          alt={item.property.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle>{item.property?.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Link href={`/properties/${item.property?._id || item.property}`}>
                        <Button className="w-full">View Details</Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Heart className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600 mb-4">Your wishlist is empty</p>
                  <Link href="/tenant">
                    <Button>Browse Rooms</Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="reviews" className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">Add a Review</h2>
            <Card>
              <CardContent className="pt-6">
                <form onSubmit={handleAddReview} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Property ID</label>
                    <input
                      type="text"
                      value={review.propertyId}
                      onChange={(e) =>
                        setReview({ ...review, propertyId: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Rating</label>
                    <select
                      value={review.rating}
                      onChange={(e) =>
                        setReview({ ...review, rating: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      {[5, 4, 3, 2, 1].map((r) => (
                        <option key={r} value={r}>
                          {r} {r === 1 ? "Star" : "Stars"}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Comment</label>
                    <textarea
                      value={review.comment}
                      onChange={(e) =>
                        setReview({ ...review, comment: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded-md min-h-[100px]"
                      required
                    />
                  </div>
                  <Button type="submit">Submit Review</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="complaints" className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">Raise a Complaint</h2>
            <Card>
              <CardContent className="pt-6">
                <form onSubmit={handleRaiseComplaint} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Property ID</label>
                    <input
                      type="text"
                      value={complaint.propertyId}
                      onChange={(e) =>
                        setComplaint({ ...complaint, propertyId: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Subject</label>
                    <input
                      type="text"
                      value={complaint.subject}
                      onChange={(e) =>
                        setComplaint({ ...complaint, subject: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Description</label>
                    <textarea
                      value={complaint.description}
                      onChange={(e) =>
                        setComplaint({ ...complaint, description: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded-md min-h-[100px]"
                      required
                    />
                  </div>
                  <Button type="submit">Submit Complaint</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">User Profile</h2>
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="text-lg font-semibold">{user?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="text-lg">{user?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="text-lg">{user?.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2">Referral Code</p>
                  <div className="flex items-center gap-2">
                    <code className="px-4 py-2 bg-gray-100 rounded-md font-mono">
                      {user?.referralCode || "N/A"}
                    </code>
                    {user?.referralCode && (
                      <Button variant="outline" size="icon" onClick={copyReferralCode}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Share this code with friends to earn rewards!
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}


