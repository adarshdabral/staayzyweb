import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | Staayzy",
  description: "Get in touch with Staayzy - we're here to help with your accommodation needs.",
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
