import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import ConvexClientProvider from "./ConvexClientProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
  preload: false, // only loaded for headings — not critical path
});

export const metadata: Metadata = {
  metadataBase: new URL("https://elizagold.com.pk"),
  title: "Eliza Gold Roghan-e-Azam Misali Hair Oil | Premium Hair Care",
  description: "Natural herbal blend made with trusted ingredients for healthier-looking hair. Eliza Gold Roghan-e-Azam Misali Hair Oil helps nourish and strengthen your hair.",
  keywords: "Eliza Gold, Roghan-e-Azam Misali, Hair Oil, Natural Hair Oil, Pakistan Hair Care, Herbal Hair Oil",
  authors: [{ name: "Eliza Gold" }],
  openGraph: {
    title: "Eliza Gold Roghan-e-Azam Misali Hair Oil",
    description: "Premium Herbal Hair Oil for Stronger & Healthier Looking Hair. 100% Natural.",
    url: "https://elizagold.com.pk",
    siteName: "Eliza Gold",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Eliza Gold Roghan-e-Azam Misali Hair Oil",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Eliza Gold Roghan-e-Azam Misali Hair Oil",
    description: "Premium Herbal Hair Oil for Stronger & Healthier Looking Hair. 100% Natural.",
    images: ["/og-image.jpg"],
  },
  alternates: {
    canonical: "https://elizagold.com.pk",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#d4a300",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`} suppressHydrationWarning>
      <head>
        {/* Critical resource hints — shave off DNS/TCP time for external origins */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://api.convex.cloud" />
        <link rel="dns-prefetch" href="https://wa.me" />
      </head>
      <body className="antialiased bg-background text-foreground selection:bg-gold-300 selection:text-black" suppressHydrationWarning>
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
