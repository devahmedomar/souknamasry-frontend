/**
 * Order-related interfaces for API communication and state management
 */

/**
 * Order Status Enum
 */
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

/**
 * Payment Status Enum
 */
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

/**
 * Order History Item - Simplified order for list view
 * Matches: GET /api/orders response
 */
export interface OrderHistoryItem {
  id: string; // MongoDB ObjectId
  date: string; // ISO 8601 DateTime
  price: number; // Total price (subtotal + shipping - discount)
  status: OrderStatus;
}

/**
 * Product snapshot in order item
 * Contains product details at time of order
 */
export interface ProductSnapshot {
  name: string;
  nameAr?: string;
  price: number;
  image: string;
}

/**
 * Detailed order item with product snapshot
 * Used in order details view
 */
export interface OrderDetailedItem {
  _id: string;
  product: string; // Product ID
  productSnapshot: ProductSnapshot;
  quantity: number;
  price: number; // Unit price
  totalPrice: number; // Quantity × price
}

/**
 * Shipping Address Details
 * Complete address object in order details
 */
export interface ShippingAddressDetails {
  name: string;
  phone: string;
  city: string;
  area: string;
  street: string;
  landmark?: string;
  apartmentNumber?: string;
}

/**
 * Order Item - For creating orders
 */
export interface OrderItem {
  product: string; // Product ID
  quantity: number;
  price: number;
  size?: string;
  color?: string;
}

/**
 * Base Order interface for creation
 */
export interface Order {
  _id: string;
  orderNumber: string; // e.g., "ORD-ABCD1234-XYZ5"
  user: string;
  items: OrderItem[];
  shippingAddress: string; // Address ID for creation
  paymentMethod: 'cod' | 'card';
  paymentStatus: PaymentStatus;
  notes?: string;
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

/**
 * Detailed Order - Extended order with full details
 * Returned from GET /api/orders/{id}
 */
export interface OrderDetailed {
  _id: string;
  orderNumber: string;
  user: string;
  items: OrderDetailedItem[]; // Detailed items with productSnapshot
  shippingAddress: ShippingAddressDetails; // Populated address object
  paymentMethod: 'cod' | 'card';
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  notes?: string;
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
 * API Response for order history (list)
 * Matches: GET /api/orders
 */
export interface OrderHistoryResponse {
  data: OrderHistoryItem[];
  message: string;
}

/**
 * API Response for detailed order
 * Matches: GET /api/orders/{id}
 */
export interface OrderDetailedResponse {
  data: OrderDetailed;
  message: string;
}

/**
 * API Response for multiple orders
 */
export interface OrdersResponse {
  success: boolean;
  data: Order[];
}
