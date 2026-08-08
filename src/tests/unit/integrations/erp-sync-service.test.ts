// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { processErpSyncJob } from '@/lib/integrations/erp/sync-service';
import { prisma } from '@/lib/infrastructure/database/prisma';
import { erpNextClient } from '@/lib/integrations/erp/erpnext/client';
import type { ErpSyncJob } from '@/lib/integrations/erp/types';

vi.mock('@/lib/infrastructure/database/prisma', () => ({
  prisma: {
    eRPSync: {
      updateMany: vi.fn(),
    },
    order: {
      update: vi.fn(),
    }
  }
}));

vi.mock('@/lib/integrations/erp/erpnext/client', () => ({
  erpNextClient: {
    createSalesOrder: vi.fn(),
  }
}));

vi.mock('@/lib/repositories/order-repository', () => ({
  markOrderErpSynced: vi.fn(),
  markOrderErpFailed: vi.fn(),
}));

// We only need to mock what processErpSyncJob touches for order.created
describe('processErpSyncJob', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockOrderJob: ErpSyncJob = {
    id: 'job-1',
    type: 'order.created',
    payload: {
      id: 'ord_123',
      userId: 'usr_1',
      total: 1000,
      subTotal: 900,
      taxTotal: 100,
      shippingTotal: 0,
      discountTotal: 0,
      status: 'PENDING',
      paymentStatus: 'PAID',
      fulfillmentStatus: 'UNFULFILLED',
      shippingAddress: {},
      billingAddress: {},
      items: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any,
    attempts: 1,
    queued_at: new Date().toISOString()
  };

  it('should successfully sync an order and update ERPSync status to SUCCESS', async () => {
    // Arrange
    vi.mocked(erpNextClient.createSalesOrder).mockResolvedValueOnce({ name: 'ERP-SO-123' });

    // Act
    await processErpSyncJob(mockOrderJob);

    // Assert
    expect(erpNextClient.createSalesOrder).toHaveBeenCalledWith(mockOrderJob.payload);
    expect(prisma.eRPSync.updateMany).toHaveBeenCalledWith({
      where: { entityType: 'order.created', entityId: 'ord_123' },
      data: { status: 'SUCCESS' }
    });
  });

  it('should mark ERPSync as FAILED and rethrow if ERP API fails', async () => {
    // Arrange
    const error = new Error('Network Error');
    vi.mocked(erpNextClient.createSalesOrder).mockRejectedValueOnce(error);

    // Act & Assert
    await expect(processErpSyncJob(mockOrderJob)).rejects.toThrow('Network Error');

    expect(prisma.eRPSync.updateMany).toHaveBeenCalledWith({
      where: { entityType: 'order.created', entityId: 'ord_123' },
      data: { 
        status: 'FAILED',
        lastError: 'Network Error',
        attempts: 1
      }
    });
  });
});
