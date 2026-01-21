"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { useToast } from "@/lib/hooks/use-toast";
import { Plus, X, Upload } from "lucide-react";

type PropertyFormProps = {
  mode?: "create" | "edit";
  initialData?: any;
  propertyId?: string;
  onSuccess?: () => void;
};

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

  const [property, setProperty] = useState(() => ({
    name: initialData?.name || "",
    nearestCollege: initialData?.nearestCollege || "",
    distanceFromCollege: initialData?.distanceFromCollege || "",
    facilities: initialData?.facilities || ([] as string[]),
    images: initialData?.images || ([] as string[]), // preview urls (objectURL or uploaded URLs)
    files: [] as File[], // actual File objects to upload
  }));

  const [rooms, setRooms] = useState<any[]>(
    initialData?.rooms?.length
      ? initialData.rooms.map((r: any) => ({ ...r }))
      : [
          {
            roomType: "single",
            capacity: 1,
            availableCount: 1,
            monthlyRent: "",
            securityDeposit: "",
            rules: [] as string[],
          },
        ]
  );

  const [newFacility, setNewFacility] = useState("");
  const [newRule, setNewRule] = useState("");
  const [currentRoomIndex, setCurrentRoomIndex] = useState(0);

  const submitMutation = useMutation({
    mutationFn: async (data: any) => {
      // Upload images first if there are files
      let imagesToUse = data.images || [];

      if (data.files && data.files.length > 0) {
        const formData = new FormData();
        data.files.forEach((f: File) => formData.append("images", f));
        const uploadResp = await api.post("/uploads/images", formData);
        imagesToUse = uploadResp.data.urls || [];
      }

      if (mode === "create") {
        const propertyResponse = await api.post("/properties", {
          name: data.name,
          nearestCollege: data.nearestCollege,
          distanceFromCollege: Number(data.distanceFromCollege),
          facilities: data.facilities,
          images: imagesToUse,
        });

        const propertyId = propertyResponse.data.property._id;

        // Add rooms
        for (const room of data.rooms) {
          await api.post(`/properties/${propertyId}/rooms`, {
            roomType: room.roomType,
            capacity: Number(room.capacity),
            availableCount: Number(room.availableCount),
            monthlyRent: Number(room.monthlyRent),
            securityDeposit: Number(room.securityDeposit),
            rules: room.rules,
          });
        }

        return propertyResponse.data;
      }

      // edit mode
      // Determine existingImages vs newImages: client should send existing images in `existingImages`
      // here we send existingImages (the images array that were not removed) and newImages (uploaded URLs)
      const existingImages = initialData?.images || [];
      const keptImages = data.images.filter((img: string) => existingImages.includes(img));
      const newImages = data.images.filter((img: string) => !existingImages.includes(img));

      // For edits, backend expects existingImages + newImages + rooms
      const payload: any = {
        ...data,
        existingImages: keptImages,
        newImages,
        rooms: data.rooms,
      };

      // Remove files/images fields from payload — files handled above
      delete payload.files;
      delete payload.images;

      const resp = await api.put(`/properties/${propertyId}`, payload);
      return resp.data;
    },
    onSuccess: (respData: any) => {
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
      toast({ title: "Error", description: error.response?.data?.message || "Failed to save property", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitMutation.mutate({ ...property, files: property.files, rooms });
  };

  const addFacility = () => {
    if (newFacility.trim()) {
      setProperty({ ...property, facilities: [...property.facilities, newFacility.trim()] });
      setNewFacility("");
    }
  };

  const removeFacility = (index: number) => {
    setProperty({ ...property, facilities: property.facilities.filter((_: any, i: number) => i !== index) });
  };

  const addRule = () => {
    if (newRule.trim() && rooms[currentRoomIndex]) {
      const updatedRooms = [...rooms];
      updatedRooms[currentRoomIndex].rules = [...updatedRooms[currentRoomIndex].rules, newRule.trim()];
      setRooms(updatedRooms);
      setNewRule("");
    }
  };

  const removeRule = (ruleIndex: number) => {
    const updatedRooms = [...rooms];
    updatedRooms[currentRoomIndex].rules = updatedRooms[currentRoomIndex].rules.filter((_: string, i: number) => i !== ruleIndex);
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
      },
    ]);
    setCurrentRoomIndex(rooms.length);
    setStep(2);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setProperty({ ...property, images: [...property.images, ...newPreviews], files: [...property.files, ...files] });
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
                    {property.facilities.map((facility: any, idx: number) => (
                      <span key={idx} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm flex items-center gap-2">
                        {facility}
                        <button type="button" onClick={() => removeFacility(idx)} className="hover:text-primary/80"><X className="h-3 w-3" /></button>
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Property Images</Label>
                  <div className="border-2 border-dashed rounded-lg p-8 text-center">
                    <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" id="image-upload" />
                    <label htmlFor="image-upload">
                      <Button type="button" variant="outline" asChild>
                        <span>Upload Images</span>
                      </Button>
                    </label>
                    <p className="text-sm text-gray-500 mt-2">Upload multiple images of your property</p>
                  </div>
                  {property.images.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 mt-4">
                      {property.images.map((img: string, idx: number) => (
                          <div key={idx} className="relative h-24 bg-gray-200 rounded">
                            <img src={img} alt={`Property ${idx + 1}`} className="w-full h-full object-cover rounded" />
                            <button type="button" onClick={() => setProperty({ ...property, images: property.images.filter((_: any, i: number) => i !== idx) })} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"><X className="h-3 w-3" /></button>
                          </div>
                        ))}
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
                          setRooms(rooms.filter((_, i) => i !== roomIdx));
                          if (currentRoomIndex >= rooms.length - 1) {
                            setCurrentRoomIndex(Math.max(0, currentRoomIndex - 1));
                          }
                        }}>
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Room Type *</Label>
                        <select value={room.roomType} onChange={(e) => { const updatedRooms = [...rooms]; updatedRooms[roomIdx].roomType = e.target.value; setRooms(updatedRooms); }} className="w-full px-3 py-2 border rounded-md" required>
                          <option value="single">Single</option>
                          <option value="sharing">Sharing</option>
                        </select>
                      </div>
                      <div>
                        <Label>Capacity *</Label>
                        <Input type="number" min="1" value={room.capacity} onChange={(e) => { const updatedRooms = [...rooms]; updatedRooms[roomIdx].capacity = e.target.value; setRooms(updatedRooms); }} required />
                      </div>
                      <div>
                        <Label>Available Count *</Label>
                        <Input type="number" min="0" value={room.availableCount} onChange={(e) => { const updatedRooms = [...rooms]; updatedRooms[roomIdx].availableCount = e.target.value; setRooms(updatedRooms); }} required />
                      </div>
                      <div>
                        <Label>Monthly Rent (₹) *</Label>
                        <Input type="number" min="0" value={room.monthlyRent} onChange={(e) => { const updatedRooms = [...rooms]; updatedRooms[roomIdx].monthlyRent = e.target.value; setRooms(updatedRooms); }} required />
                      </div>
                      <div>
                        <Label>Security Deposit (₹) *</Label>
                        <Input type="number" min="0" value={room.securityDeposit} onChange={(e) => { const updatedRooms = [...rooms]; updatedRooms[roomIdx].securityDeposit = e.target.value; setRooms(updatedRooms); }} required />
                      </div>
                    </div>
                    <div>
                      <Label>Room Rules</Label>
                      <div className="flex gap-2 mb-2">
                        <Input value={roomIdx === currentRoomIndex ? newRule : ""} onChange={(e) => { setNewRule(e.target.value); setCurrentRoomIndex(roomIdx); }} placeholder="e.g., No smoking, No pets" onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addRule())} />
                        <Button type="button" onClick={() => { setCurrentRoomIndex(roomIdx); addRule(); }}><Plus className="h-4 w-4" /></Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {room.rules.map((rule: string, ruleIdx: number) => (
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


