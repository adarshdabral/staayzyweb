export type UserRole = "tenant" | "owner" | "admin";

export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  referralCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Property {
  _id: string;
  owner: string;
  name: string;
  nearestCollege: string;
  distanceFromCollege: number;
  facilities: string[];
  images: string[];
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
}

export interface Room {
  _id: string;
  property: Property | string;
  roomType: "single" | "sharing";
  capacity: number;
  availableCount: number;
  monthlyRent: number;
  securityDeposit: number;
  rules: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  _id: string;
  tenant: string | User;
  property: string | Property;
  room: string | Room;
  rent: number;
  securityDeposit: number;
  status: "pending" | "approved" | "rejected" | "completed" | "cancelled";
  startDate: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  _id: string;
  property: string;
  tenant: string | User;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export interface Complaint {
  _id: string;
  tenant: string | User;
  property: string | Property;
  subject: string;
  description: string;
  status: "pending" | "in-progress" | "resolved" | "rejected";
  createdAt: string;
  updatedAt: string;
}

export interface Wishlist {
  _id: string;
  tenant: string;
  property: string | Property;
  createdAt: string;
}

export interface Referral {
  _id: string;
  referrer: string | User;
  referred: string | User;
  referralCode: string;
  createdAt: string;
}


