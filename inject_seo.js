const fs = require('fs');
const path = 'src/app/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Inject JSON-LD
const returnTarget = `<div className="min-h-screen bg-[#faf8f5] text-[#1c1917] font-sans selection:bg-[#d4af37]/20 selection:text-[#0b2912] overflow-x-hidden" suppressHydrationWarning>`;

const jsonLdCode = `
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org/",
            "@type": "Product",
            "name": "Eliza Gold Roghan-e-Azam Misali Hair Oil",
            "image": [
              "https://eliza.pk/assets/product-1.webp"
            ],
            "description": "Natural herbal blend made with trusted ingredients for healthier-looking hair. Eliza Gold Roghan-e-Azam Misali Hair Oil helps nourish and strengthen your hair.",
            "brand": {
              "@type": "Brand",
              "name": "Eliza Gold"
            },
            "offers": {
              "@type": "AggregateOffer",
              "url": "https://eliza.pk",
              "priceCurrency": "PKR",
              "lowPrice": "1299",
              "highPrice": "3499",
              "offerCount": "3",
              "availability": "https://schema.org/InStock",
              "itemCondition": "https://schema.org/NewCondition"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.9",
              "reviewCount": "128"
            }
          })
        }}
      />
`;

if (content.includes(returnTarget) && !content.includes('application/ld+json')) {
    content = content.replace(returnTarget, returnTarget + jsonLdCode);
}

// 2. Fix thumbnail alt tags
content = content.replace('alt={`Thumbnail ${idx + 1}`}', 'alt={`Eliza Gold Roghan-e-Azam Thumbnail ${idx + 1}`}');

fs.writeFileSync(path, content, 'utf8');
console.log('Injected JSON-LD and updated image alts');
