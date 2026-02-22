import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card";
  import { Shield, Users, Home, Target } from "lucide-react";
  import Link from "next/link";
  import { Button } from "@/components/ui/button";
  
  export const metadata = {
    title: "About Us | Staayzy",
    description: "Learn about Staayzy - your trusted platform for student accommodation near colleges.",
  };
  
  export default function AboutPage() {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-4xl font-bold mb-4">About Staayzy</h1>
          <p className="text-xl text-gray-600 mb-12">
            Your trusted platform for finding the perfect student accommodation near colleges.
          </p>
  
          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
            <p className="text-gray-700 leading-relaxed">
              Staayzy connects property owners with genuine student tenants, making the process
              of finding and listing accommodation simple, transparent, and hassle-free. We believe
              every student deserves a safe, comfortable place to stay close to their campus,
              and every property owner deserves direct access to verified tenants.
            </p>
          </section>
  
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            <Card>
              <CardHeader>
                <Home className="h-8 w-8 text-primary mb-2" />
                <CardTitle>For Students</CardTitle>
                <CardDescription>
                  Browse verified rooms and PGs near your college. No brokers, no hidden fees,
                  transparent pricing.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Users className="h-8 w-8 text-primary mb-2" />
                <CardTitle>For Owners</CardTitle>
                <CardDescription>
                  List your property, manage availability, and connect directly with students
                  looking for accommodation.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Shield className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Verified Platform</CardTitle>
                <CardDescription>
                  Role-based access and transparent processes ensure secure interactions
                  for everyone.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Target className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Stay Hassle Free</CardTitle>
                <CardDescription>
                  We simplify the search, booking, and management of student housing in one place.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
  
          <div className="text-center">
            <Link href="/">
              <Button variant="outline">Back to Home</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }
  