// Test script to create an order with different product sizes
const { MongoClient } = require('mongodb');

async function createTestOrder() {
  const client = new MongoClient(process.env.DATABASE_URL);
  
  try {
    await client.connect();
    const db = client.db();
    
    // Create a test order with products that have different sizes
    const testOrder = {
      id: Math.floor(Math.random() * 1000000000),
      customerName: "Size Test Customer",
      customerEmail: "test-sizes@example.com",
      customerPhone: "+1234567890",
      shippingAddress: "123 Test Street, Test City, Test State 12345",
      orderItems: [
        {
          productId: 2107033888,
          name: "iPhone 15 Pro Max",
          price: 89999,
          quantity: 1,
          weight: "256GB"
        },
        {
          productId: 2107033890,
          name: "MacBook Pro",
          price: 159999,
          quantity: 1,
          weight: "16GB RAM"
        },
        {
          productId: 2107033892,
          name: "AirPods Pro",
          price: 24900,
          quantity: 2,
          weight: "Standard"
        }
      ],
      totalAmount: "364797.00",
      status: "Processing",
      createdAt: new Date()
    };
    
    // Insert the test order
    await db.collection('orders').insertOne(testOrder);
    console.log('Test order created successfully with ID:', testOrder.id);
    
  } catch (error) {
    console.error('Error creating test order:', error);
  } finally {
    await client.close();
  }
}

createTestOrder();