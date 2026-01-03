/**
 * Order-related interfaces for API communication and state management
 */

export interface OrderItem {
  product: string; // Product ID
  quantity: number;
  price: number;
  size?: string;
  color?: string;
}

export interface Order {
  _id: string;
  orderNumber: string; // e.g., "ORD-1704211200000-abc123"
  user: string;
  items: OrderItem[];
  shippingAddress: string; // Address ID or populated Address object
  paymentMethod: 'cod' | 'card';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  notes?: string;
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

/**
 * Request payload for creating an order
 * Matches the API contract: POST /api/orders
 */
export interface CreateOrderRequest {
  shippingAddressId: string; // MongoDB ObjectId
  paymentMethod: 'cod' | 'card';
  notes?: string; // Optional, max 500 chars
}

/**
 * API Response for single order
 */
export interface OrderResponse {
  success: boolean;
  data: Order;
}

/**
 * API Response for multiple orders
 */
export interface OrdersResponse {
  success: boolean;
  data: Order[];
}
