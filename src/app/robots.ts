import { MetadataRoute } from 'next';

import { businessConfig } from "@/config/business.config";

export default function robots(): MetadataRoute.Robots {
  const SITE_URL = businessConfig.domain;

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/account/', '/checkout/'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
