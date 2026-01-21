"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { useToast } from "@/lib/hooks/use-toast";
import {
  Home,
  Calendar,
  DollarSign,
  Users,
  AlertCircle,
  Check,
  X,
  Shield,
  FileText,
  Eye,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export default function AdminDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);
  const [selectedComplaint, setSelectedComplaint] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [userRole, setUserRole] = useState<"tenant" | "owner" | "admin">("tenant");
  const [adminNotes, setAdminNotes] = useState("");

  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const response = await api.get("/admin/dashboard");
      return response.data;
    },
  });

  const { data: pendingProperties } = useQuery({
    queryKey: ["pending-properties"],
    queryFn: async () => {
      const response = await api.get("/admin/properties/pending");
      return response.data;
    },
  });

  const { data: complaints } = useQuery({
    queryKey: ["admin-complaints"],
    queryFn: async () => {
      const response = await api.get("/admin/complaints");
      return response.data;
    },
  });

  const { data: allUsers } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const response = await api.get("/admin/users");
      return response.data;
    },
  });

  const { data: auditLogs } = useQuery({
    queryKey: ["admin-audit-logs"],
    queryFn: async () => {
      const response = await api.get("/admin/audit-logs");
      return response.data;
    },
  });

  const approvePropertyMutation = useMutation({
    mutationFn: async (propertyId: string) => {
      return api.put(`/admin/properties/${propertyId}/approve`);
    },
    onSuccess: () => {
      toast({ title: "Property approved" });
      queryClient.invalidateQueries({ queryKey: ["pending-properties"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to approve property",
        variant: "destructive",
      });
    },
  });

  const rejectPropertyMutation = useMutation({
    mutationFn: async ({ propertyId, reason }: { propertyId: string; reason: string }) => {
      return api.put(`/admin/properties/${propertyId}/reject`, { rejectionReason: reason });
    },
    onSuccess: () => {
      toast({ title: "Property rejected" });
      queryClient.invalidateQueries({ queryKey: ["pending-properties"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      setRejectionReason("");
      setSelectedProperty(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to reject property",
        variant: "destructive",
      });
    },
  });

  const updateComplaintStatusMutation = useMutation({
    mutationFn: async ({
      complaintId,
      status,
      notes,
    }: {
      complaintId: string;
      status: string;
      notes?: string;
    }) => {
      return api.put(`/admin/complaints/${complaintId}/status`, {
        status,
        adminNotes: notes,
      });
    },
    onSuccess: () => {
      toast({ title: "Complaint status updated" });
      queryClient.invalidateQueries({ queryKey: ["admin-complaints"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      setAdminNotes("");
      setSelectedComplaint(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update complaint",
        variant: "destructive",
      });
    },
  });

  const updateUserRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      return api.put("/admin/users/role", { userId, role });
    },
    onSuccess: () => {
      toast({ title: "User role updated" });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update user role",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage properties, bookings, and users</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Listings</CardTitle>
              <Home className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalListings || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.pendingProperties || 0} pending approval
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalBookings || 0}</div>
              <p className="text-xs text-muted-foreground">All time bookings</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{(stats?.totalRevenue || 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">From all bookings</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.pendingComplaints || 0} pending complaints
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="properties" className="space-y-6">
          <TabsList>
            <TabsTrigger value="properties">Property Approval</TabsTrigger>
            <TabsTrigger value="complaints">Complaints</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="audit">Audit Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="properties" className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">Pending Property Approvals</h2>
            {pendingProperties?.length > 0 ? (
              <div className="space-y-4">
                {pendingProperties.map((property: any) => (
                  <Card key={property._id}>
                    <CardHeader>
                      <CardTitle>{property.name}</CardTitle>
                      <CardDescription>
                        {property.nearestCollege} • {property.distanceFromCollege} km • Owner:{" "}
                        {property.owner?.name || "N/A"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-4">
                        <p className="text-sm font-semibold mb-2">Facilities:</p>
                        <div className="flex flex-wrap gap-2">
                          {property.facilities?.map((facility: string, idx: number) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-gray-100 rounded text-sm"
                            >
                              {facility}
                            </span>
                          ))}
                        </div>
                      </div>
                      {property.images && property.images.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm font-semibold mb-2">Images:</p>
                          <div className="grid grid-cols-4 gap-2">
                            {property.images.slice(0, 4).map((img: string, idx: number) => (
                              <div key={idx} className="h-24 bg-gray-200 rounded overflow-hidden">
                                <img
                                  src={img}
                                  alt={`${property.name} ${idx + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="flex gap-4">
                        <Button
                          onClick={() => approvePropertyMutation.mutate(property._id)}
                          disabled={approvePropertyMutation.isPending}
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => setSelectedProperty(property._id)}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                        <a
                          href={`/properties/${property._id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button variant="outline">
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                        </a>
                      </div>
                      {selectedProperty === property._id && (
                        <div className="mt-4 space-y-2">
                          <Input
                            placeholder="Rejection reason"
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() =>
                                rejectPropertyMutation.mutate({
                                  propertyId: property._id,
                                  reason: rejectionReason,
                                })
                              }
                              disabled={!rejectionReason || rejectPropertyMutation.isPending}
                            >
                              Confirm Rejection
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedProperty(null);
                                setRejectionReason("");
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-gray-600">No pending properties</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="complaints" className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">Complaint Management</h2>
            {complaints?.length > 0 ? (
              <div className="space-y-4">
                {complaints.map((complaint: any) => (
                  <Card key={complaint._id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>{complaint.subject}</CardTitle>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            complaint.status === "resolved"
                              ? "bg-green-100 text-green-800"
                              : complaint.status === "in-progress"
                              ? "bg-blue-100 text-blue-800"
                              : complaint.status === "rejected"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {complaint.status.toUpperCase()}
                        </span>
                      </div>
                      <CardDescription>
                        Property: {complaint.property?.name || "N/A"} • Tenant:{" "}
                        {complaint.tenant?.name || "N/A"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="mb-4">{complaint.description}</p>
                      {complaint.adminNotes && (
                        <div className="mb-4 p-3 bg-gray-100 rounded">
                          <p className="text-sm font-semibold mb-1">Admin Notes:</p>
                          <p className="text-sm">{complaint.adminNotes}</p>
                        </div>
                      )}
                      <div className="flex gap-2 flex-wrap">
                        <Button
                          size="sm"
                          onClick={() =>
                            updateComplaintStatusMutation.mutate({
                              complaintId: complaint._id,
                              status: "in-progress",
                            })
                          }
                          disabled={updateComplaintStatusMutation.isPending}
                        >
                          Mark In Progress
                        </Button>
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() =>
                            updateComplaintStatusMutation.mutate({
                              complaintId: complaint._id,
                              status: "resolved",
                            })
                          }
                          disabled={updateComplaintStatusMutation.isPending}
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Resolve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setSelectedComplaint(complaint._id)}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                      {selectedComplaint === complaint._id && (
                        <div className="mt-4 space-y-2">
                          <Input
                            placeholder="Admin notes"
                            value={adminNotes}
                            onChange={(e) => setAdminNotes(e.target.value)}
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() =>
                                updateComplaintStatusMutation.mutate({
                                  complaintId: complaint._id,
                                  status: "rejected",
                                  notes: adminNotes,
                                })
                              }
                              disabled={updateComplaintStatusMutation.isPending}
                            >
                              Confirm Rejection
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedComplaint(null);
                                setAdminNotes("");
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-gray-600">No complaints</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">User Management</h2>
            {allUsers?.length > 0 ? (
              <div className="space-y-4">
                {allUsers.map((user: any) => (
                  <Card key={user._id}>
                    <CardHeader>
                      <CardTitle>{user.name}</CardTitle>
                      <CardDescription>{user.email} • {user.phone}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-gray-500" />
                          <span className="capitalize font-semibold">{user.role}</span>
                        </div>
                        {user.role !== "admin" && (
                          <Select
                            value={userRole}
                            onValueChange={(value: "tenant" | "owner" | "admin") => {
                              setUserRole(value);
                              updateUserRoleMutation.mutate({
                                userId: user._id,
                                role: value,
                              });
                            }}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Change role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="tenant">Tenant</SelectItem>
                              <SelectItem value="owner">Owner</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                      {user.referralCode && (
                        <p className="text-sm text-gray-600 mt-2">
                          Referral Code: <code className="font-mono">{user.referralCode}</code>
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-gray-600">No users found</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="audit" className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">Audit Logs</h2>
            {auditLogs?.length > 0 ? (
              <div className="space-y-2">
                {auditLogs.map((log: any) => (
                  <Card key={log._id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold capitalize">
                            {log.action.replace(/_/g, " ")}
                          </p>
                          <p className="text-sm text-gray-600">
                            {log.resource} {log.resourceId && `• ID: ${log.resourceId}`}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            By {log.admin?.name || "Unknown"} •{" "}
                            {new Date(log.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <FileText className="h-5 w-5 text-gray-400" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-gray-600">No audit logs yet</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}


