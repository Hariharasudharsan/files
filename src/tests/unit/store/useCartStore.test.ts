import { describe, it, expect, beforeEach } from 'vitest';
import { useCartStore } from '@/store/useCartStore';

describe('useCartStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useCartStore.setState({ items: [], isOpen: false, hasHydrated: true });
  });

  const mockProduct = {
    id: 'p1',
    name: 'Test Product',
    slug: 'test-product',
    category_id: 'c1',
    variants: [],
    created_at: '',
    updated_at: '',
  } as any;

  const mockVariant = {
    id: 'v1',
    item_code: 'TEST-001',
    name: 'Standard Pack',
    price: 100,
    inventoryLevels: [],
    images: [],
  } as any;

  it('should initialize with an empty cart', () => {
    const state = useCartStore.getState();
    expect(state.items).toHaveLength(0);
    expect(state.isOpen).toBe(false);
  });

  it('should add an item to the cart and open it', () => {
    useCartStore.getState().addItem(mockProduct, mockVariant, 2);
    
    const state = useCartStore.getState();
    expect(state.items).toHaveLength(1);
    expect(state.items[0]).toMatchObject({
      item_code: 'TEST-001',
      product_name: 'Test Product',
      price: 100,
      qty: 2,
    });
    expect(state.isOpen).toBe(true);
  });

  it('should increment quantity if the item already exists', () => {
    const store = useCartStore.getState();
    store.addItem(mockProduct, mockVariant, 1);
    store.addItem(mockProduct, mockVariant, 2);
    
    const state = useCartStore.getState();
    expect(state.items).toHaveLength(1);
    expect(state.items[0].qty).toBe(3);
  });

  it('should update quantity correctly', () => {
    const store = useCartStore.getState();
    store.addItem(mockProduct, mockVariant, 1);
    store.updateQty('TEST-001', 5);
    
    const state = useCartStore.getState();
    expect(state.items[0].qty).toBe(5);
  });

  it('should remove item if quantity is updated to 0 or less', () => {
    const store = useCartStore.getState();
    store.addItem(mockProduct, mockVariant, 1);
    store.updateQty('TEST-001', 0);
    
    const state = useCartStore.getState();
    expect(state.items).toHaveLength(0);
  });

  it('should remove item explicitly', () => {
    const store = useCartStore.getState();
    store.addItem(mockProduct, mockVariant, 1);
    store.removeItem('TEST-001');
    
    const state = useCartStore.getState();
    expect(state.items).toHaveLength(0);
  });

  it('should calculate total items and price correctly', () => {
    const store = useCartStore.getState();
    
    const variant2 = { ...mockVariant, item_code: 'TEST-002', price: 250 };
    
    store.addItem(mockProduct, mockVariant, 2); // 2 * 100 = 200
    store.addItem(mockProduct, variant2, 1);    // 1 * 250 = 250
    
    // Using get() from inside the store to reflect latest state
    const totals = useCartStore.getState();
    expect(totals.totalItems).toBe(3);
    expect(totals.totalPrice).toBe(450);
  });

  it('should clear cart', () => {
    const store = useCartStore.getState();
    store.addItem(mockProduct, mockVariant, 1);
    store.clearCart();
    
    const state = useCartStore.getState();
    expect(state.items).toHaveLength(0);
  });
});
