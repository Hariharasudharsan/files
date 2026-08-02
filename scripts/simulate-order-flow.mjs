import crypto from 'crypto';

const API_URL = 'http://localhost:3000/api';

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function simulateOrderFlow() {
  console.log("🚀 Starting End-to-End Order Simulation...");
  
  // 1. Create a fake order via our Next.js API
  console.log("\n[1/3] Placing an order on the storefront...");
  const orderPayload = {
    items: [
      { item_code: "VAD-001", qty: 2, rate: 120 },
      { item_code: "OMP-001", qty: 1, rate: 110 }
    ],
    contact: {
      name: "Automation Test User",
      email: "e2e@example.com",
      phone: "9876543210",
      address: "123 Test Street",
      city: "Test City",
      state: "Test State",
      pincode: "123456"
    }
  };

  const createRes = await fetch(`${API_URL}/v1/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderPayload)
  });

  if (!createRes.ok) {
    const error = await createRes.text();
    console.error("❌ Failed to create order:", error);
    process.exit(1);
  }

  const { orderId } = await createRes.json();
  console.log(`✅ Order created successfully! [ID: ${orderId}]`);
  
  // 2. Simulate Razorpay Webhook
  console.log("\n[2/3] Simulating Razorpay successful payment webhook...");
  
  // To ensure the webhook matches the order, we simulate the Razorpay transaction ID.
  const razorpayPayload = {
    event: "payment.captured",
    payload: {
      payment: {
        entity: {
          id: `pay_${crypto.randomBytes(8).toString('hex')}`,
          amount: 35000, // 350 INR in paise
          currency: "INR",
          status: "captured",
          notes: {
            order_id: orderId // Tie payment to our system order ID
          }
        }
      }
    }
  };

  const webhookRes = await fetch(`${API_URL}/webhooks/razorpay`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(razorpayPayload)
  });

  if (!webhookRes.ok) {
    console.error("❌ Webhook processing failed:", await webhookRes.text());
  } else {
    console.log("✅ Webhook accepted by server (Event saved & queued)!");
  }

  console.log("\n[3/3] Monitoring Backend Queues...");
  console.log("Check the Admin UI at http://localhost:3000/admin/queues and http://localhost:3000/admin/sync-logs");
  console.log("You should see the PROCESS_WEBHOOK job complete, followed by the SYNC_ORDER job!");

  console.log("\n🎉 Simulation Complete! Check your Dashboard.");
}

simulateOrderFlow().catch(console.error);
