"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Home,
  Calendar,
  Users,
  DollarSign,
  Eye,
  Edit,
  Check,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { useToast } from "@/lib/hooks/use-toast";
import { PropertyForm } from "../properties/new/page";

export default function OwnerDashboardClient() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, token } = useAuthStore();
  const { toast } = useToast();

  useEffect(() => {
    if (!token) {
      router.replace("/auth/login");
      return;
    }

    if (user && user.role !== "owner") {
      router.replace("/");
    }
  }, [token, user?.role, router]);

  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");
  const propertyId = searchParams.get("propertyId");
  const isEditMode = mode === "edit" && !!propertyId;

  const { data: properties = [] } = useQuery({
    queryKey: ["owner-properties"],
    queryFn: async () => {
      const res = await api.get("/properties?owner=me");
      return res.data;
    },
    enabled: !!token,
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ["owner-bookings"],
    queryFn: async () => {
      const res = await api.get("/bookings");
      return res.data;
    },
    enabled: !!token,
  });

  const {
    data: editPropertyData,
    isLoading: isEditLoading,
  } = useQuery({
    queryKey: ["property", propertyId],
    queryFn: async () => {
      const res = await api.get(`/properties/${propertyId}`);
      return res.data?.property || res.data;
    },
    enabled: isEditMode && !!token,
  });

  const deletePropertyMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/properties/${id}`);
    },
    onSuccess: () => {
      toast({ title: "Property deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["owner-properties"] });
    },
  });

  const updateBookingStatusMutation = useMutation({
    mutationFn: async ({ bookingId, status }: { bookingId: string; status: string }) => {
      await api.patch(`/bookings/${bookingId}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["owner-bookings"] });
    },
  });

  if (!token || !user) return null;

  if (isEditMode) {
    if (isEditLoading) return null;

    if (!editPropertyData) {
      return (
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-600 mb-4">Property not found.</p>
                <Button onClick={() => router.push("/owner/dashboard")}>Back to Dashboard</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }

    return (
      <PropertyForm
        mode="edit"
        propertyId={propertyId}
        initialData={editPropertyData}
        onSuccess={() => router.push("/owner/dashboard")}
      />
    );
  }

  const totalProperties = properties.length;
  const approvedProperties = properties.filter((p: any) => p.status === "approved").length;
  const pendingProperties = properties.filter((p: any) => p.status === "pending").length;

  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter((b: any) => b.status === "pending").length;

  const totalRevenue = bookings.filter((b: any) => b.status === "approved").reduce((sum: number, b: any) => sum + (b.rent || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Owner Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user.name}!</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard title="Total Properties" value={totalProperties} subtitle={`${approvedProperties} approved, ${pendingProperties} pending`} icon={<Home />} />
          <StatCard title="Total Bookings" value={totalBookings} subtitle={`${pendingBookings} pending approval`} icon={<Calendar />} />
          <StatCard title="Total Revenue" value={`₹${totalRevenue.toLocaleString()}`} subtitle="From approved bookings" icon={<DollarSign />} />
          <StatCard title="Interested Tenants" value={totalBookings} subtitle="Booking requests" icon={<Users />} />
        </div>

        <Tabs defaultValue="properties" className="space-y-6">
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <TabsList className="flex gap-2 min-w-max">
              <TabsTrigger value="properties">My Properties</TabsTrigger>
              <TabsTrigger value="bookings">Booking Requests</TabsTrigger>
              <TabsTrigger value="earnings">Earnings</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="properties">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Your Properties</h2>
              <Link href="/owner/properties/new">
                <Button>Add New Property</Button>
              </Link>
            </div>

            {properties.length === 0 ? (
              <EmptyCard text="No properties yet">
                <Link href="/owner/properties/new">
                  <Button>Add Your First Property</Button>
                </Link>
              </EmptyCard>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {properties.map((property: any) => (
                  <PropertyCard
                    key={property._id}
                    property={property}
                    canEdit
                    onView={() => router.push(`/properties/${property._id}`)}
                    onEdit={() => router.push(`/owner/dashboard?propertyId=${property._id}&mode=edit`)}
                    onDelete={() => {
                      if (!confirm("Are you sure you want to delete this property?")) return;
                      deletePropertyMutation.mutate(property._id);
                    }}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="bookings">
            {bookings.length === 0 ? (
              <EmptyCard text="No booking requests yet" />
            ) : (
              bookings.map((booking: any) => (
                <BookingCard key={booking._id} booking={booking} onUpdate={updateBookingStatusMutation.mutate} loading={updateBookingStatusMutation.isPending} />
              ))
            )}
          </TabsContent>

          <TabsContent value="earnings">
            <Card>
              <CardHeader>
                <CardTitle>Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-primary">₹{totalRevenue.toLocaleString()}</div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function StatCard({ title, value, subtitle, icon }: any) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </CardContent>
    </Card>
  );
}

function EmptyCard({ text, children }: any) {
  return (
    <Card>
      <CardContent className="py-12 text-center">
        <p className="text-gray-600 mb-4">{text}</p>
        {children}
      </CardContent>
    </Card>
  );
}

function PropertyCard({ property, canEdit, onView, onEdit, onDelete }: any) {
  return (
    <Card>
      {property.images?.[0] && <img src={property.images[0]} alt={property.name} className="h-48 w-full object-cover" />}
      <CardHeader>
        <CardTitle>{property.name}</CardTitle>
        <CardDescription>
          {property.nearestCollege} • {property.distanceFromCollege} km
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col sm:flex-row gap-2">
        <Button variant="outline" className="flex-1" onClick={onView}>
          <Eye className="mr-2 h-4 w-4" /> View
        </Button>
        {canEdit && (
          <>
            <Button variant="outline" className="flex-1" onClick={onEdit}>
              <Edit className="mr-2 h-4 w-4" /> Edit
            </Button>
            <Button variant="destructive" className="flex-1" onClick={onDelete}>
              Delete
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function BookingCard({ booking, onUpdate, loading }: any) {
  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>{booking.property?.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex justify-between items-center">
        <span>{booking.status.toUpperCase()}</span>
        {booking.status === "pending" && (
          <div className="flex gap-2">
            <Button size="sm" onClick={() => onUpdate({ bookingId: booking._id, status: "approved" })} disabled={loading}>
              <Check className="mr-1 h-4 w-4" /> Approve
            </Button>
            <Button size="sm" variant="destructive" onClick={() => onUpdate({ bookingId: booking._id, status: "rejected" })} disabled={loading}>
              <X className="mr-1 h-4 w-4" /> Reject
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
