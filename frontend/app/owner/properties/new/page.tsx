"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { useToast } from "@/lib/hooks/use-toast";
import { Plus, X, Upload } from "lucide-react";

/** Unified media: existing Cloudinary URL or pending file with blob preview. Never send blob URLs to backend. */
type MediaItem =
  | { kind: "cloudinary"; url: string }
  | { kind: "pending"; file: File; preview: string };

type PropertyFormProps = {
  mode?: "create" | "edit";
  initialData?: any;
  propertyId?: string;
  onSuccess?: () => void;
};

function toNumber(v: unknown): number {
  const n = Number(v);
  return Number.isNaN(n) ? 0 : n;
}

export function PropertyForm({
  mode = "create",
  initialData = null,
  propertyId,
  onSuccess,
}: PropertyFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);

  const [media, setMedia] = useState<MediaItem[]>(() => {
    const urls = initialData?.images || [];
    return urls
      .filter((u: string) => typeof u === "string" && !u.startsWith("blob:"))
      .map((url: string) => ({ kind: "cloudinary" as const, url }));
  });

  const [property, setProperty] = useState(() => ({
    name: initialData?.name || "",
    nearestCollege: initialData?.nearestCollege || "",
    distanceFromCollege: initialData?.distanceFromCollege || "",
    facilities: initialData?.facilities || ([] as string[]),
  }));

  const [rooms, setRooms] = useState<any[]>(
    initialData?.rooms?.length
      ? initialData.rooms.map((r: any) => ({ ...r, rules: r.rules ?? [] }))
      : [
          {
            roomType: "single",
            capacity: 1,
            availableCount: 1,
            monthlyRent: "",
            securityDeposit: "",
            rules: [] as string[],
            allowedGender: "both",
            occupancyStatus: "vacant",
            occupiedCount: 0,
            vacantCount: 1,
          },
        ]
  );

  const [newFacility, setNewFacility] = useState("");
  const [newRule, setNewRule] = useState("");
  const [currentRoomIndex, setCurrentRoomIndex] = useState(0);

  const submitMutation = useMutation({
    mutationFn: async (data: { property: typeof property; media: MediaItem[]; rooms: any[] }) => {
      const existingUrls = data.media
        .filter((m): m is Extract<MediaItem, { kind: "cloudinary" }> => m.kind === "cloudinary")
        .map((m) => m.url);
      const pendingFiles = data.media
        .filter((m): m is Extract<MediaItem, { kind: "pending" }> => m.kind === "pending")
        .map((m) => m.file);

      let finalUrls = existingUrls;
      if (pendingFiles.length > 0) {
        const formData = new FormData();
        pendingFiles.forEach((f) => formData.append("images", f));
        const uploadResp = await api.post("/uploads/images", formData);
        const uploadedUrls = uploadResp.data.urls || [];
        finalUrls = [...existingUrls, ...uploadedUrls];
      }

      if (mode === "create") {
        const propertyResponse = await api.post("/properties", {
          name: data.property.name,
          nearestCollege: data.property.nearestCollege,
          distanceFromCollege: toNumber(data.property.distanceFromCollege),
          facilities: data.property.facilities,
          images: finalUrls,
        });

        const id = propertyResponse.data.property._id;
        for (const room of data.rooms) {
          await api.post(`/properties/${id}/rooms`, {
            roomType: room.roomType,
            capacity: toNumber(room.capacity),
            availableCount: toNumber(room.availableCount),
            monthlyRent: toNumber(room.monthlyRent),
            securityDeposit: toNumber(room.securityDeposit),
            rules: room.rules || [],
            allowedGender: room.allowedGender || "both",
            occupancyStatus: room.occupancyStatus || "vacant",
            occupiedCount: toNumber(room.occupiedCount),
            vacantCount: toNumber(room.vacantCount),
          });
        }
        return propertyResponse.data;
      }

      if (!propertyId) {
        throw new Error("Property ID is required for update");
      }

      const payload = {
        name: data.property.name,
        nearestCollege: data.property.nearestCollege,
        distanceFromCollege: toNumber(data.property.distanceFromCollege),
        facilities: data.property.facilities,
        images: finalUrls,
        rooms: data.rooms.map((room: any) => ({
          roomType: room.roomType,
          capacity: toNumber(room.capacity),
          availableCount: toNumber(room.availableCount),
          monthlyRent: toNumber(room.monthlyRent),
          securityDeposit: toNumber(room.securityDeposit),
          rules: room.rules || [],
          allowedGender: room.allowedGender || "both",
          occupancyStatus: room.occupancyStatus || "vacant",
          occupiedCount: toNumber(room.occupiedCount),
          vacantCount: toNumber(room.vacantCount),
        })),
      };

      const resp = await api.put(`/properties/${propertyId}`, payload);
      return resp.data;
    },
    onSuccess: () => {
      if (mode === "create") {
        toast({ title: "Property created", description: "Your property has been submitted for approval" });
        queryClient.invalidateQueries({ queryKey: ["owner-properties"] });
        router.push("/owner/dashboard");
      } else {
        toast({ title: "Property updated", description: "Property updated successfully" });
        queryClient.invalidateQueries({ queryKey: ["owner-properties"] });
        if (onSuccess) onSuccess();
        else router.push("/owner/dashboard");
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to save property",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitMutation.mutate({ property, media, rooms });
  };

  const addFacility = () => {
    if (newFacility.trim()) {
      setProperty({ ...property, facilities: [...property.facilities, newFacility.trim()] });
      setNewFacility("");
    }
  };

  const removeFacility = (index: number) => {
    setProperty({ ...property, facilities: property.facilities.filter((_: string, i: number) => i !== index) });
  };

  const addRule = () => {
    if (newRule.trim() && rooms[currentRoomIndex]) {
      const updatedRooms = [...rooms];
      const rules = updatedRooms[currentRoomIndex].rules ?? [];
      updatedRooms[currentRoomIndex].rules = [...rules, newRule.trim()];
      setRooms(updatedRooms);
      setNewRule("");
    }
  };

  const removeRule = (ruleIndex: number) => {
    const updatedRooms = [...rooms];
    const rules = updatedRooms[currentRoomIndex].rules ?? [];
    updatedRooms[currentRoomIndex].rules = rules.filter((_: string, i: number) => i !== ruleIndex);
    setRooms(updatedRooms);
  };

  const addRoom = () => {
    setRooms([
      ...rooms,
      {
        roomType: "single",
        capacity: 1,
        availableCount: 1,
        monthlyRent: "",
        securityDeposit: "",
        rules: [],
        allowedGender: "both",
        occupancyStatus: "vacant",
        occupiedCount: 0,
        vacantCount: 1,
      },
    ]);
    setCurrentRoomIndex(rooms.length);
    setStep(2);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const newItems: MediaItem[] = files.map((file) => ({
      kind: "pending",
      file,
      preview: URL.createObjectURL(file),
    }));
    setMedia((prev) => [...prev, ...newItems]);
    e.target.value = "";
  };

  const removeMedia = (index: number) => {
    setMedia((prev) => {
      const item = prev[index];
      if (item?.kind === "pending" && item.preview) URL.revokeObjectURL(item.preview);
      return prev.filter((_: MediaItem, i: number) => i !== index);
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-4xl font-bold mb-8">{mode === "create" ? "List Your Property" : "Edit Property"}</h1>

        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Property Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Property Name *</Label>
                  <Input id="name" value={property.name} onChange={(e) => setProperty({ ...property, name: e.target.value })} required placeholder="e.g., Sunshine Apartments" />
                </div>
                <div>
                  <Label htmlFor="nearestCollege">Nearest College *</Label>
                  <Input id="nearestCollege" value={property.nearestCollege} onChange={(e) => setProperty({ ...property, nearestCollege: e.target.value })} required placeholder="e.g., MIT" />
                </div>
                <div>
                  <Label htmlFor="distance">Distance from College (km) *</Label>
                  <Input id="distance" type="number" step="0.1" value={property.distanceFromCollege} onChange={(e) => setProperty({ ...property, distanceFromCollege: e.target.value })} required placeholder="e.g., 2.5" />
                </div>
                <div>
                  <Label>Facilities</Label>
                  <div className="flex gap-2 mb-2">
                    <Input value={newFacility} onChange={(e) => setNewFacility(e.target.value)} placeholder="e.g., WiFi, AC, Parking" onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addFacility())} />
                    <Button type="button" onClick={addFacility}><Plus className="h-4 w-4" /></Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {property.facilities.map((facility: string, idx: number) => (
                      <span key={idx} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm flex items-center gap-2">
                        {facility}
                        <button type="button" onClick={() => removeFacility(idx)} className="hover:text-primary/80" aria-label="Remove facility"><X className="h-3 w-3" /></button>
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Property Images & Videos</Label>
                  <div className="border-2 border-dashed rounded-lg p-8 text-center">
                    <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <input type="file" accept="image/*,video/*" multiple onChange={handleImageUpload} className="hidden" id="image-upload" />
                    <label htmlFor="image-upload">
                      <Button type="button" variant="outline" asChild>
                        <span>Upload Media</span>
                      </Button>
                    </label>
                    <p className="text-sm text-gray-500 mt-2">Upload images or videos of your property</p>
                  </div>
                  {media.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 mt-4">
                      {media.map((item, idx) => {
                        const src = item.kind === "cloudinary" ? item.url : item.preview;
                        const isVideo =
                          item.kind === "pending"
                            ? item.file.type.startsWith("video")
                            : /\.(mp4|webm|mov|avi)(\?|$)/i.test(item.url) || /\/video\/upload\//i.test(item.url);
                        return (
                          <div key={idx} className="relative h-24 bg-gray-200 rounded">
                            {isVideo ? (
                              <video src={src} className="w-full h-full object-cover rounded" controls />
                            ) : (
                              <img src={src} alt={`Media ${idx + 1}`} className="w-full h-full object-cover rounded" />
                            )}
                            <button type="button" onClick={() => removeMedia(idx)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1">
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                <Button type="button" onClick={() => setStep(2)} className="w-full">Next: Add Rooms</Button>
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Room Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {rooms.map((room, roomIdx) => (
                  <div key={roomIdx} className="border rounded-lg p-4 space-y-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold">Room {roomIdx + 1}</h3>
                      {rooms.length > 1 && (
                        <Button type="button" variant="ghost" size="sm" onClick={() => {
                          setRooms(rooms.filter((_: unknown, i: number) => i !== roomIdx));
                          setCurrentRoomIndex((prev) => {
                            if (prev === roomIdx) return Math.max(0, roomIdx - 1);
                            if (prev > roomIdx) return prev - 1;
                            return prev;
                          });
                        }}>
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Room Type *</Label>
                        <select value={room.roomType} onChange={(e) => { const u = [...rooms]; u[roomIdx].roomType = e.target.value; setRooms(u); }} className="w-full px-3 py-2 border rounded-md" required>
                          <option value="single">Single</option>
                          <option value="sharing">Sharing</option>
                        </select>
                      </div>
                      <div>
                        <Label>Capacity *</Label>
                        <Input type="number" min={1} value={room.capacity} onChange={(e) => { const u = [...rooms]; u[roomIdx].capacity = e.target.value; setRooms(u); }} required />
                      </div>
                      <div>
                        <Label>Available Count *</Label>
                        <Input type="number" min={0} value={room.availableCount} onChange={(e) => { const u = [...rooms]; u[roomIdx].availableCount = e.target.value; setRooms(u); }} required />
                      </div>
                      <div>
                        <Label>Monthly Rent (₹) *</Label>
                        <Input type="number" min={0} value={room.monthlyRent} onChange={(e) => { const u = [...rooms]; u[roomIdx].monthlyRent = e.target.value; setRooms(u); }} required />
                      </div>
                      <div>
                        <Label>Security Deposit (₹) *</Label>
                        <Input type="number" min={0} value={room.securityDeposit} onChange={(e) => { const u = [...rooms]; u[roomIdx].securityDeposit = e.target.value; setRooms(u); }} required />
                      </div>
                      <div>
                        <Label>Allowed For *</Label>
                        <select value={room.allowedGender} onChange={(e) => { const u = [...rooms]; u[roomIdx].allowedGender = e.target.value; setRooms(u); }} className="w-full px-3 py-2 border rounded-md">
                          <option value="boys">Boys</option>
                          <option value="girls">Girls</option>
                          <option value="both">Both</option>
                        </select>
                      </div>
                      <div>
                        <Label>Occupancy Status *</Label>
                        <select value={room.occupancyStatus} onChange={(e) => { const u = [...rooms]; u[roomIdx].occupancyStatus = e.target.value; setRooms(u); }} className="w-full px-3 py-2 border rounded-md">
                          <option value="vacant">Vacant</option>
                          <option value="occupied">Occupied</option>
                        </select>
                      </div>
                      <div>
                        <Label>Occupied Count</Label>
                        <Input type="number" min={0} value={room.occupiedCount} onChange={(e) => { const u = [...rooms]; u[roomIdx].occupiedCount = e.target.value; setRooms(u); }} />
                      </div>
                      <div>
                        <Label>Vacant Count</Label>
                        <Input type="number" min={0} value={room.vacantCount} onChange={(e) => { const u = [...rooms]; u[roomIdx].vacantCount = e.target.value; setRooms(u); }} />
                      </div>
                    </div>
                    <div>
                      <Label>Room Rules</Label>
                      <div className="flex gap-2 mb-2">
                        <Input value={roomIdx === currentRoomIndex ? newRule : ""} onChange={(e) => { setNewRule(e.target.value); setCurrentRoomIndex(roomIdx); }} placeholder="e.g., No smoking" onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addRule())} />
                        <Button type="button" onClick={() => { setCurrentRoomIndex(roomIdx); addRule(); }}><Plus className="h-4 w-4" /></Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {room.rules?.map((rule: string, ruleIdx: number) => (
                          <span key={ruleIdx} className="px-3 py-1 bg-gray-100 rounded-full text-sm flex items-center gap-2">
                            {rule}
                            <button type="button" onClick={() => removeRule(ruleIdx)} className="hover:text-red-500"><X className="h-3 w-3" /></button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
                <Button type="button" onClick={addRoom} variant="outline" className="w-full"><Plus className="h-4 w-4 mr-2" />Add Another Room Type</Button>
                <div className="flex gap-4">
                  <Button type="button" onClick={() => setStep(1)} variant="outline" className="flex-1">Back</Button>
                  <Button type="submit" disabled={submitMutation.isPending} className="flex-1">{submitMutation.isPending ? "Submitting..." : mode === "create" ? "Submit Property" : "Save Changes"}</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </form>
      </div>
    </div>
  );
}

export default function NewPropertyPage() {
  return <PropertyForm mode="create" />;
}
