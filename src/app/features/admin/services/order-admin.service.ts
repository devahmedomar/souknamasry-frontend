import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  Order,
  UpdateOrderStatusDto,
  UpdatePaymentStatusDto,
  OrdersResponse,
  OrderResponse,
  OrderQueryParams,
} from '../models/order.model';

@Injectable({
  providedIn: 'root',
})
export class OrderAdminService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}admin/orders`;

  /**
   * Get all orders with pagination and filtering
   * GET /api/admin/orders?page=1&limit=20&orderStatus=pending&paymentStatus=paid&search=ORD-123&startDate=2026-01-01&endDate=2026-01-31
   */
  getAllOrders(params: OrderQueryParams = {}): Observable<OrdersResponse> {
    let httpParams = new HttpParams();

    if (params.page) {
      httpParams = httpParams.set('page', params.page.toString());
    }
    if (params.limit) {
      httpParams = httpParams.set('limit', params.limit.toString());
    }
    if (params.status) {
      httpParams = httpParams.set('status', params.status);
    }
    if (params.paymentStatus) {
      httpParams = httpParams.set('paymentStatus', params.paymentStatus);
    }
    if (params.search) {
      httpParams = httpParams.set('search', params.search);
    }
    if (params.startDate) {
      httpParams = httpParams.set('startDate', params.startDate);
    }
    if (params.endDate) {
      httpParams = httpParams.set('endDate', params.endDate);
    }

    return this.http.get<OrdersResponse>(this.apiUrl, { params: httpParams });
  }

  /**
   * Get order by ID
   * GET /api/admin/orders/:id
   */
  getOrderById(id: string): Observable<OrderResponse> {
    return this.http.get<OrderResponse>(`${this.apiUrl}/${id}`);
  }

  /**
   * Update order status
   * PATCH /api/admin/orders/:id/status
   */
  updateOrderStatus(
    id: string,
    data: UpdateOrderStatusDto
  ): Observable<OrderResponse> {
    return this.http.patch<OrderResponse>(`${this.apiUrl}/${id}/status`, data);
  }

  /**
   * Update payment status
   * PATCH /api/admin/orders/:id/payment-status
   */
  updatePaymentStatus(
    id: string,
    data: UpdatePaymentStatusDto
  ): Observable<OrderResponse> {
    return this.http.patch<OrderResponse>(
      `${this.apiUrl}/${id}/payment-status`,
      data
    );
  }

  /**
   * Delete order
   * DELETE /api/admin/orders/:id
   */
  deleteOrder(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
