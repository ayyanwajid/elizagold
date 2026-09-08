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
  metadataBase: new URL("https://eliza.pk"),
  title: "Eliza Gold Roghan-e-Azam Misali Hair Oil | Premium Hair Care Pakistan",
  description: "Buy original Eliza Gold Roghan-e-Azam Misali herbal hair oil online. Natural treatment for hair growth, hair fall, and stronger hair in Pakistan.",
  keywords: "Eliza Gold, Roghan-e-Azam Misali, Hair Oil, Natural Hair Oil, Pakistan Hair Care, Herbal Hair Oil, Best hair oil for hair growth and hair fall in Pakistan, Buy original Eliza Gold hair oil online, Roghan-e-Azam Misali price in Pakistan, Natural treatment for hair growth",
  authors: [{ name: "Eliza Gold" }],
  openGraph: {
    title: "Eliza Gold Roghan-e-Azam Misali Hair Oil",
    description: "Premium Herbal Hair Oil for Stronger & Healthier Looking Hair. Buy online in Pakistan.",
    url: "https://eliza.pk",
    siteName: "Eliza Gold",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Eliza Gold Roghan-e-Azam Misali Herbal Hair Oil Bottle",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Eliza Gold Roghan-e-Azam Misali Hair Oil",
    description: "Premium Herbal Hair Oil for Stronger & Healthier Looking Hair. Buy online in Pakistan.",
    images: ["/og-image.jpg"],
  },
  alternates: {
    canonical: "https://eliza.pk",
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
