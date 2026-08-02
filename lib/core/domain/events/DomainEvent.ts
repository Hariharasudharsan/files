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
  };

  constructor(orderId: string, userId: string, total: number) {
    this.id = crypto.randomUUID();
    this.aggregateId = orderId;
    this.occurredAt = new Date();
    this.payload = {
      orderId,
      userId,
      total
    };
  }
}
