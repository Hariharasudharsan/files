import { businessConfig } from "@/config/business.config";

export function getProductImageFallback(imageUrl?: string | null): string {
  if (imageUrl) return imageUrl;
  // A generic fallback image showing a package or box
  return "/placeholder-product.jpg"; 
}

export function generateImageAlt(productName: string, context?: string): string {
  return `${productName} ${context ? `- ${context}` : ''} | ${businessConfig.brandName}`;
}
