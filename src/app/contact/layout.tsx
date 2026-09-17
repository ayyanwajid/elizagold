import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Customer Support | Eliza Gold Pakistan",
  description: "Contact Eliza Gold Pakistan official customer care. 24/7 WhatsApp helpline, order status inquiries, and dispatch hubs across Lahore, Karachi, & Islamabad.",
  alternates: {
    canonical: "https://eliza.pk/contact",
  },
  openGraph: {
    title: "Contact Customer Support | Eliza Gold Pakistan",
    description: "Contact Eliza Gold Pakistan official customer care. 24/7 WhatsApp helpline & order tracking assistance.",
    url: "https://eliza.pk/contact",
    siteName: "Eliza Gold Pakistan",
    images: [
      {
        url: "https://eliza.pk/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Contact Eliza Gold Pakistan Support",
      },
    ],
    locale: "en_PK",
    type: "website",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
