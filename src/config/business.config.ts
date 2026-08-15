export type BusinessConfig = {
  brandName: string;
  legalName: string;
  domain: string;

  supportEmail: string;
  supportPhone: string;
  whatsappNumber: string;

  address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };

  social: {
    instagram?: string;
    facebook?: string;
    x?: string;
    youtube?: string;
  };

  compliance: {
    fssaiLicense?: string;
    gstNumber?: string;
  };

  seo: {
    defaultTitle: string;
    defaultDescription: string;
    ogImage: string;
  };
};

export const businessConfig: BusinessConfig = {
  brandName: "Sridha's Store",
  legalName: process.env.NEXT_PUBLIC_LEGAL_NAME || "Sridha's Store",
  domain: process.env.NEXT_PUBLIC_DOMAIN || "localhost",

  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@sridhasstore.com",
  supportPhone: process.env.NEXT_PUBLIC_SUPPORT_PHONE || "+91 7708838059",
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP || "+91 7708838059",

  address: {
    line1: process.env.NEXT_PUBLIC_ADDRESS_LINE1 || "415/1B, Mettu street, venbedu",
    line2: process.env.NEXT_PUBLIC_ADDRESS_LINE2 || "",
    city: process.env.NEXT_PUBLIC_CITY || "Chengalpattu",
    state: process.env.NEXT_PUBLIC_STATE || "Tamil Nadu",
    pincode: process.env.NEXT_PUBLIC_PINCODE || "603110",
    country: "India",
  },

  social: {
    instagram: process.env.NEXT_PUBLIC_INSTAGRAM,
    facebook: process.env.NEXT_PUBLIC_FACEBOOK,
    x: process.env.NEXT_PUBLIC_X,
    youtube: process.env.NEXT_PUBLIC_YOUTUBE,
  },

  compliance: {
    fssaiLicense: process.env.NEXT_PUBLIC_FSSAI || undefined,
    gstNumber: process.env.NEXT_PUBLIC_GST || "",
  },

  seo: {
    defaultTitle: "Sridha's Store - Authentic Indian Food Products",
    defaultDescription:
      "Shop premium Indian food products, snacks, and traditional items from Sridha's Store.",
    ogImage: "/og-image.jpg",
  },
};
