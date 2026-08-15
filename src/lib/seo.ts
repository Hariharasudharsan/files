import { businessConfig } from "@/config/business.config";

export function getDefaultSEO() {
  return {
    title: {
      default: businessConfig.seo.defaultTitle,
      template: `%s | ${businessConfig.brandName}`,
    },
    description: businessConfig.seo.defaultDescription,
    openGraph: {
      type: "website",
      locale: "en_IN",
      url: businessConfig.domain,
      siteName: businessConfig.brandName,
      title: businessConfig.seo.defaultTitle,
      description: businessConfig.seo.defaultDescription,
      images: [businessConfig.seo.ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: businessConfig.seo.defaultTitle,
      description: businessConfig.seo.defaultDescription,
      images: [businessConfig.seo.ogImage],
    },
  };
}

export function getOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: businessConfig.brandName,
    url: businessConfig.domain,
    logo: `${businessConfig.domain}/logo.png`,
    description: businessConfig.seo.defaultDescription,
    contactPoint: {
      "@type": "ContactPoint",
      "telephone": businessConfig.supportPhone,
      "contactType": "Customer Service"
    },
    sameAs: [
      businessConfig.social.instagram,
      businessConfig.social.facebook,
      businessConfig.social.x,
      businessConfig.social.youtube,
    ].filter(Boolean),
  };
}

export function getWebSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    url: businessConfig.domain,
    potentialAction: {
      "@type": "SearchAction",
      "target": `${businessConfig.domain}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };
}

export function getProductJsonLd(product: any) {
  const defaultVariant = product.variants?.[0];
  const availableStock = defaultVariant?.inventoryLevels?.reduce((sum: number, il: any) => sum + il.available, 0) || 0;
  
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || `${product.name} — authentic, factory-direct from ${businessConfig.brandName}.`,
    image: product.primaryImage?.url || undefined,
    sku: defaultVariant?.item_code,
    category: businessConfig.brandName, 
    brand: { "@type": "Brand", name: businessConfig.brandName },
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: defaultVariant?.price?.toFixed(2) || "0.00",
      availability: availableStock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };
}

export function getBreadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
