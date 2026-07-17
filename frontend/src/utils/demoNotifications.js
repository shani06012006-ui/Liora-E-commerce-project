// frontend/src/utils/demoNotifications.js
export const DEMO_NOTIFICATIONS = [
  {
    id: 1,
    title: '🛒 New Order Placed',
    message: 'Order #ORD-7890 has been placed by John Doe',
    type: 'order',
    read: false,
    created_at: new Date().toISOString(),
    action_link: '/admin/orders'
  },
  {
    id: 2,
    title: '📦 Order Shipped',
    message: 'Order #ORD-7889 has been shipped to Jane Smith',
    type: 'order',
    read: false,
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    action_link: '/admin/orders'
  },
  {
    id: 3,
    title: '⚠️ Low Stock Alert',
    message: 'Product "Velvet Blazer" has only 3 items left in stock',
    type: 'inventory',
    read: false,
    created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    action_link: '/admin/products'
  },
  {
    id: 4,
    title: '⭐ New Review Posted',
    message: 'Customer left a 5-star review on "Silk Saree"',
    type: 'review',
    read: true,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    action_link: '/admin/reviews'
  },
  {
    id: 5,
    title: '💳 Payment Received',
    message: 'Payment of ₹2,499 received for order #ORD-7888',
    type: 'payment',
    read: true,
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    action_link: '/admin/payments/transactions'
  }
];