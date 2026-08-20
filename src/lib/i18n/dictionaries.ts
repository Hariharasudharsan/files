import { prisma } from '@/lib/infrastructure/database/prisma';
import { cache } from 'react';

const defaultDictionary: Record<string, string> = {
  'nav.home': 'Home',
  'nav.shop': 'Shop',
  'nav.bundles': 'Bundles',
  'nav.about': 'About Us',
  'cart.title': 'Your Cart',
  'cart.checkout': 'Checkout',
  'cart.empty': 'Your cart is empty',
  'product.add_to_cart': 'Add to Cart',
  'product.subscribe': 'Subscribe & Save',
  'product.one_time': 'One-time Purchase',
};

// React cache to avoid refetching multiple times per request
export const getDictionary = cache(async (locale: string) => {
  if (locale === 'en') {
    return defaultDictionary;
  }

  try {
    const setting = await prisma.settings.findUnique({
      where: { key: `translations_${locale}` }
    });

    if (setting && setting.value && typeof setting.value === 'object') {
      return { ...defaultDictionary, ...(setting.value as Record<string, string>) };
    }
  } catch (error) {
    console.error(`Failed to load dictionary for ${locale}:`, error);
  }

  return defaultDictionary;
});

// Translation Helper Hook for Server Components
export async function useTranslation(locale: string) {
  const dict = await getDictionary(locale);
  return (key: string, variables?: Record<string, string | number>) => {
    let text = dict[key] || defaultDictionary[key] || key;
    if (variables) {
      Object.keys(variables).forEach(k => {
        text = text.replace(new RegExp(`{${k}}`, 'g'), String(variables[k]));
      });
    }
    return text;
  };
}
