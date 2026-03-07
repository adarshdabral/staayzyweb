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
    "PG near UPES",
    "Student accommodation Dehradun",
    "Rental rooms for students",
    "Staayzy",
  ],

  authors: [{ name: "Staayzy Team", url: "https://staayzy.com" }],
  creator: "Staayzy",
  publisher: "Staayzy",
  category: "Housing & Real Estate",

  /* --------- ICONS --------- */
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },

  /* --------- OPEN GRAPH --------- */
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
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Staayzy Student Housing Platform",
      },
    ],
  },

  /* --------- TWITTER --------- */
  twitter: {
    card: "summary_large_image",
    title: "Staayzy | Student Living Made Easy",
    description:
      "Find verified PGs & rental housing near colleges in Dehradun.",
    creator: "@staayzy",
    images: ["/og-image.jpg"],
  },

  /* --------- CANONICAL --------- */
  alternates: {
    canonical: "https://staayzy.com",
  },

  /* --------- ROBOTS --------- */
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-video-preview": -1,
      "max-snippet": -1,
    },
  },

  /* --------- APP LINKS (MOBILE) --------- */
  appLinks: {
    web: {
      url: "https://staayzy.com",
      should_fallback: true,
    },
  },

  /* --------- VERIFICATION --------- */
  verification: {
    google: "ADD_GOOGLE_SEARCH_CONSOLE_CODE",
  },

  /* --------- REFERRER --------- */
  referrer: "origin-when-cross-origin",

  /* --------- FORMAT DETECTION --------- */
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
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

          {/* Structured Data for SEO */}
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify([
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "Staayzy",
        url: "https://staayzy.com",
        logo: "https://staayzy.com/logo.png",
        sameAs: [
          "https://instagram.com/staayzy",
        ],
      },
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "Staayzy",
        url: "https://staayzy.com",
        potentialAction: {
          "@type": "SearchAction",
          target: "https://staayzy.com/search?q={search_term_string}",
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        name: "Staayzy",
        image: "https://staayzy.com/og-image.jpg",
        url: "https://staayzy.com",
        telephone: "+91-8273432429",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Dehradun",
          addressRegion: "Uttarakhand",
          addressCountry: "IN",
        },
        areaServed: "Dehradun",
        priceRange: "₹₹",
      },
    ]),
  }}
/>

        <SpeedInsights />
      </body>
    </html>
  );
}