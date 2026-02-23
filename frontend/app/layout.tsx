import type { Metadata } from "next";
import { Geist, Geist_Mono, Great_Vibes } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { SpeedInsights } from "@vercel/speed-insights/next";

/* ---------------- FONTS ---------------- */

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-great-vibes",
});

/* ---------------- SEO METADATA ---------------- */

export const metadata: Metadata = {
  metadataBase: new URL("https://staayzy.com"),

  title: {
    default: "Staayzy | PG & Student Housing in Dehradun",
    template: "%s | Staayzy",
  },

  description:
    "Find verified PGs, hostels and rental rooms near colleges in Dehradun. Transparent pricing, safe stays and hassle-free booking with Staayzy.",

  keywords: [
    "PG in Dehradun",
    "Student housing in Dehradun",
    "Hostel near GEU",
    "PG near Graphic Era University",
    "Rental rooms for students",
    "Staayzy",
  ],

  authors: [{ name: "Staayzy Team" }],
  creator: "Staayzy",
  publisher: "Staayzy",

  openGraph: {
    title: "Staayzy | PG & Student Housing in Dehradun",
    description:
      "Book verified PGs and rental rooms near your college. Safe, affordable and hassle-free stays.",
    url: "https://staayzy.com",
    siteName: "Staayzy",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/og-image.jpg", // Add inside public folder
        width: 1200,
        height: 630,
        alt: "Staayzy Student Housing Platform",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Staayzy | Student Living Made Easy",
    description:
      "Find verified PGs & rental housing near colleges in Dehradun.",
    images: ["/og-image.jpg"],
  },

  alternates: {
    canonical: "https://staayzy.com",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

/* ---------------- ROOT LAYOUT ---------------- */

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={greatVibes.variable}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>

        {/* Organization Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Staayzy",
              url: "https://staayzy.com",
              logo: "https://staayzy.com/logo.png",
              sameAs: [
                "https://instagram.com/staayzy",
              ],
            }),
          }}
        />

        <SpeedInsights />
      </body>
    </html>
  );
}