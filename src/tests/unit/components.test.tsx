import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AddToCartButton from '@/components/AddToCartButton';
import type { Product } from '@/lib/domain/entities/product';

// Mock the Zustand store
vi.mock('@/store/useCartStore', () => ({
  useCartStore: vi.fn((selector) => {
    // Return a mock addItem function
    if (selector.toString().includes('addItem')) {
      return vi.fn();
    }
    return vi.fn();
  }),
}));

const mockProduct: Product = {
  id: '1',
  slug: 'test-product',
  name: 'Test Product',
  description: 'A product for testing',
  category_id: null,
  ingredients: null,
  nutritional_info: null,
  shelf_life_days: null,
  variants: [
    {
      id: 'v1',
      productId: '1',
      itemCode: 'SKU-1',
      name: 'Standard',
      price: 100,
      inventoryLevels: [{ warehouseId: 'w1', available: 50, reserved: 0, committed: 0, sold: 0, damaged: 0, returned: 0 }],
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any
  ],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

describe('AddToCartButton', () => {
  it('renders correctly and is enabled when stock is available', () => {
    render(<AddToCartButton product={mockProduct} />);
    const button = screen.getByRole('button', { name: /add to cart/i });
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
  });

  it('is disabled when stock is zero', () => {
    const outOfStockProduct = {
      ...mockProduct,
      variants: [
        {
          ...mockProduct.variants[0],
          inventoryLevels: [{ warehouseId: 'w1', available: 0, reserved: 0, committed: 0, sold: 0, damaged: 0, returned: 0 }]
        }
      ]
    };
    render(<AddToCartButton product={outOfStockProduct as any} />);
    const button = screen.getByRole('button', { name: /add to cart/i });
    expect(button).toBeDisabled();
  });
});
