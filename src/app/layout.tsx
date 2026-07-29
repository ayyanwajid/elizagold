import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        <meta name="theme-color" content="#d4a300" />
      </head>
      <body className="antialiased bg-background text-foreground selection:bg-gold-300 selection:text-black">
        {children}
      </body>
    </html>
  );
}
