import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card";
  import { Button } from "@/components/ui/button";
  import { HelpCircle } from "lucide-react";
  import Link from "next/link";
  
  export const metadata = {
    title: "FAQ | Staayzy",
    description: "Frequently asked questions about Staayzy - student accommodation platform.",
  };
  
  const faqs = [
    {
      q: "How do I list my property on Staayzy?",
      a: "Sign up as an owner, create your account, and add your property with details like location, rent, room types, and photos. Once submitted, your listing will be reviewed and made visible to students.",
    },
    {
      q: "How do I find accommodation as a student?",
      a: "Sign up as a tenant, browse properties near your college, and submit booking requests for rooms you like. Owners will review and approve or reject your request.",
    },
    {
      q: "Is Staayzy free to use?",
      a: "Students can browse and request bookings for free. Property owners can list their properties and manage bookings through the platform. Check our pricing for any applicable fees.",
    },
    {
      q: "How are properties verified?",
      a: "Listings go through a review process before being published. We ensure basic information is complete and accurate before making properties visible to tenants.",
    },
    {
      q: "Can I edit my property listing after submission?",
      a: "Yes. Owners can edit property details, update room availability, change rent, and manage images from the owner dashboard at any time.",
    },
    {
      q: "What happens after I submit a booking request?",
      a: "The property owner will review your request and either approve or reject it. You'll be notified of the decision. If approved, you can proceed with moving in as per the agreed terms.",
    },
  ];
  
  export default function FAQPage() {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="flex items-center gap-3 mb-8">
            <HelpCircle className="h-10 w-10 text-primary" />
            <div>
              <h1 className="text-4xl font-bold">Frequently Asked Questions</h1>
              <p className="text-gray-600 mt-1">
                Quick answers to common questions about Staayzy
              </p>
            </div>
          </div>
  
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <Card key={idx}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{faq.q}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
  
          <div className="mt-12 text-center space-y-4">
            <p className="text-gray-600">
              Still have questions? Get in touch with us.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/contact">
                <Button>Contact Us</Button>
              </Link>
              <Link href="/">
                <Button variant="outline">Back to Home</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
  