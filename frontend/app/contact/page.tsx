"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, MapPin, Phone, Send } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useToast } from "@/lib/hooks/use-toast";

export default function ContactPage() {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { name, email, subject, message } = form;
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast({ title: "Please fill in required fields", variant: "destructive" });
      return;
    }
    const mailto = `mailto:support@staayzy.com?subject=${encodeURIComponent(subject || "Contact from Staayzy")}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`)}`;
    toast({ title: "Opening email client", description: "Your default email app will open with this message." });
    setForm({ name: "", email: "", subject: "", message: "" });
    setTimeout(() => { window.location.href = mailto; }, 150);
  };
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
          <p className="text-xl text-gray-600 mb-12">
            Have a question or feedback? We&apos;d love to hear from you.
          </p>
  
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <Card>
              <CardHeader>
                <Mail className="h-6 w-6 text-primary mb-2" />
                <CardTitle>Email</CardTitle>
                <CardDescription>
                  Reach us at{" "}
                  <a
                    href="mailto:support@staayzy.com"
                    className="text-primary hover:underline"
                  >
                    support@staayzy.com
                  </a>
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Phone className="h-6 w-6 text-primary mb-2" />
                <CardTitle>Phone</CardTitle>
                <CardDescription>
                  Call us at{" "}
                  <a href="tel:+911234567890" className="text-primary hover:underline">
                    +91 123 456 7890
                  </a>
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="md:col-span-2">
              <CardHeader>
                <MapPin className="h-6 w-6 text-primary mb-2" />
                <CardTitle>Office</CardTitle>
                <CardDescription>
                  123 Campus Road, College Town<br />
                  City, State - 123456
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
  
          <Card>
            <CardHeader>
              <CardTitle>Send us a message</CardTitle>
              <CardDescription>
                Fill out the form below and we&apos;ll get back to you as soon as possible.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Name *</Label>
                    <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" className="mt-1" required />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="your@email.com" className="mt-1" required />
                  </div>
                </div>
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="What is this regarding?" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="message">Message *</Label>
                  <textarea
                    id="message"
                    rows={4}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Your message..."
                    className="w-full px-3 py-2 mt-1 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <Button type="submit" className="w-full md:w-auto">
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>
  
          <div className="text-center mt-8">
            <Link href="/">
              <Button variant="outline">Back to Home</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }
  