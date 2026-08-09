export interface DomainEvent<T = any> {
  id: string; // Unique event ID
  aggregateId: string; // The ID of the entity that changed (e.g. Order ID)
  aggregateType: string; // The type of entity (e.g. "Order")
  eventType: string; // Name of the event (e.g. "OrderPaid")
  occurredAt: Date; // When the event happened
  payload: T; // The actual data of the event
}

export class OrderPaidEvent implements DomainEvent {
  public id: string;
  public aggregateId: string;
  public aggregateType = 'Order';
  public eventType = 'OrderPaid';
  public occurredAt: Date;
  public payload: {
    orderId: string;
    amount: number;
    transactionId: string;
  };

  constructor(orderId: string, amount: number, transactionId: string) {
    this.id = crypto.randomUUID();
    this.aggregateId = orderId;
    this.occurredAt = new Date();
    this.payload = {
      orderId,
      amount,
      transactionId,
    };
  }
}

export class OrderCreatedEvent implements DomainEvent {
  public id: string;
  public aggregateId: string;
  public aggregateType = 'Order';
  public eventType = 'OrderCreated';
  public occurredAt: Date;
  public payload: {
    orderId: string;
    userId: string;
    total: number;
    whatsappOptIn?: boolean;
    userPhone?: string;
  };

  constructor(orderId: string, userId: string, total: number, whatsappOptIn?: boolean, userPhone?: string) {
    this.id = crypto.randomUUID();
    this.aggregateId = orderId;
    this.occurredAt = new Date();
    this.payload = {
      orderId,
      userId,
      total,
      whatsappOptIn,
      userPhone
    };
  }
}

export class ProductUpdatedEvent implements DomainEvent {
  public id: string;
  public aggregateId: string;
  public aggregateType = 'Product';
  public eventType = 'ProductUpdated';
  public occurredAt: Date;
  public payload: {
    slug: string;
    product?: any;
  };

  constructor(slug: string, product?: any) {
    this.id = crypto.randomUUID();
    this.aggregateId = slug;
    this.occurredAt = new Date();
    this.payload = {
      slug,
      product,
    };
  }
}
