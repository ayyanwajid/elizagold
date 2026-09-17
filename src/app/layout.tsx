import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import ConvexClientProvider from "./ConvexClientProvider";
import { CartProvider } from "@/context/CartContext";

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
  icons: {
    icon: [
      { url: "/icon.jpg" },
      { url: "/assets/logo-icon.webp", type: "image/webp" },
    ],
    apple: "/icon.jpg",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "Eliza Gold Roghan-e-Azam Misali Hair Oil | Premium Hair Care Pakistan",
    description: "Buy original Eliza Gold Roghan-e-Azam Misali herbal hair oil online. Natural treatment for hair growth, hair fall, and stronger hair in Pakistan.",
    url: "https://eliza.pk",
    siteName: "Eliza Gold Pakistan",
    images: [
      {
        url: "https://eliza.pk/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Eliza Gold Roghan-e-Azam Misali Herbal Hair Oil Bottle",
        type: "image/jpeg",
      },
    ],
    locale: "en_PK",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Eliza Gold Roghan-e-Azam Misali Hair Oil | Premium Hair Care Pakistan",
    description: "Buy original Eliza Gold Roghan-e-Azam Misali herbal hair oil online with 100% Cash On Delivery across Pakistan.",
    images: ["https://eliza.pk/og-image.jpg"],
  },
  alternates: {
    canonical: "https://eliza.pk",
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
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
        {/* Organization Schema for Google Knowledge Graph */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Eliza Gold Pakistan",
              "url": "https://eliza.pk",
              "logo": "https://eliza.pk/assets/logo-icon.webp",
              "image": "https://eliza.pk/og-image.jpg",
              "description": "Pakistan's premier 100% organic Ayurvedic hair care brand. Empowering natural hair growth & scalp repair.",
              "email": "support@elizagold.pk",
              "telephone": "+923287657890",
              "contactPoint": [
                {
                  "@type": "ContactPoint",
                  "telephone": "+923287657890",
                  "contactType": "customer service",
                  "areaServed": "PK",
                  "availableLanguage": ["en", "ur"]
                }
              ],
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "PK"
              }
            })
          }}
        />
        {/* Critical resource hints — shave off DNS/TCP time for external origins */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://api.convex.cloud" />
        <link rel="dns-prefetch" href="https://wa.me" />
        
        {/* Meta Pixel Code */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '2325674008175949');
fbq('track', 'PageView');
            `,
          }}
        />
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=2325674008175949&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
        {/* TikTok Pixel Code */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
!function (w, d, t) {
  w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var a=document.createElement("script");a.type="text/javascript",a.async=!0,a.src=r+"?sdkid="+e+"&lib="+t;var c=document.getElementsByTagName("script")[0];c.parentNode.insertBefore(a,c)};
  var ttPixelId = "${process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID || ""}";
  if (ttPixelId) {
    ttq.load(ttPixelId);
    ttq.page();
  }
}(window, document, 'ttq');
            `,
          }}
        />

        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
                `,
              }}
            />
          </>
        )}
      </head>
      <body className="antialiased bg-background text-foreground selection:bg-gold-300 selection:text-black" suppressHydrationWarning>
        <ConvexClientProvider>
          <CartProvider>{children}</CartProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
