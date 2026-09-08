const fs = require('fs');
const path = 'src/app/layout.tsx';
let content = fs.readFileSync(path, 'utf8');

const targetMetadata = `export const metadata: Metadata = {
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
};`;

const newMetadata = `export const metadata: Metadata = {
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
};`;

if (content.includes('metadataBase: new URL("https://elizagold.com.pk")')) {
    content = content.replace(targetMetadata, newMetadata);
    fs.writeFileSync(path, content, 'utf8');
    console.log('Updated metadata in layout.tsx');
} else {
    console.log('Metadata target not found or already updated');
}
