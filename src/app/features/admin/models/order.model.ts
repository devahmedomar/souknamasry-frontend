export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface OrderItem {
  product: string; // Product ID
  productSnapshot: {
    name: string;
    price: number;
    image: string;
  };
  quantity: number;
  price: number;
  totalPrice: number;
}

export interface ShippingAddress {
  name: string;
  phone: string;
  city: string;
  area: string;
  street: string;
  landmark: string;
  apartmentNumber: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  shippingAddress: ShippingAddress;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface UpdateOrderStatusDto {
  status: OrderStatus;
}

export interface UpdatePaymentStatusDto {
  paymentStatus: PaymentStatus;
}

export interface OrdersResponse {
  status: string;
  data: {
    orders: Order[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export interface OrderResponse {
  status: string;
  data: Order;
}

export interface OrderQueryParams {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  search?: string;
  startDate?: string;
  endDate?: string;
}
