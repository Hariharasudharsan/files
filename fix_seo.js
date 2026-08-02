const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app/product/[slug]/page.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// Add Metadata import
if (!content.includes('import type { Metadata } from "next"')) {
  content = `import type { Metadata } from "next";\n` + content;
}

// Add generateMetadata function
const generateMetadataFn = `
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  
  if (!product) {
    return { title: 'Product Not Found' };
  }

  return {
    title: product.name,
    description: product.description?.slice(0, 160) || \`Buy \${product.name} online at Mathuram Foods.\`,
    openGraph: {
      title: product.name,
      description: product.description?.slice(0, 160),
      images: product.variants[0]?.image ? [{ url: product.variants[0].image }] : [],
    },
  };
}
`;

if (!content.includes('generateMetadata')) {
  content = content.replace('export default async function ProductPage', generateMetadataFn + '\nexport default async function ProductPage');
}

// Add JSON-LD script
const jsonLdScript = `
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": product.variants[0]?.image,
    "description": product.description || \`Buy \${product.name} online at Mathuram Foods.\`,
    "sku": product.variants[0]?.item_code,
    "offers": {
      "@type": "Offer",
      "url": \`https://www.mathuramfoods.com/product/\${product.slug}\`,
      "priceCurrency": "INR",
      "price": product.variants[0]?.price,
      "itemCondition": "https://schema.org/NewCondition",
      "availability": product.variants[0]?.available_stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
    }
  };
`;

if (!content.includes('application/ld+json')) {
  // Insert jsonLd definition before return
  content = content.replace('return (', jsonLdScript + '\n  return (\n    <>\n      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />');
  
  // Close the <> fragment at the end of the return statement
  content = content.replace('    </div>\n  );\n}', '    </div>\n    </>\n  );\n}');
}

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Updated app/product/[slug]/page.tsx');
