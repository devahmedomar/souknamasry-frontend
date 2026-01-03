import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
    CreateOrderRequest,
    OrderResponse,
    OrdersResponse,
    OrderHistoryResponse,
    OrderDetailedResponse
} from '../../../shared/models/order.interface';

/**
 * Order Service - Handles all order-related HTTP requests
 * Responsibilities:
 * - API communication for order operations
 * - Create orders
 * - Fetch order history (future feature)
 */
@Injectable({
    providedIn: 'root'
})
export class OrderService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = `${environment.apiUrl}orders`;

    /**
     * Create a new order
     * POST /api/orders
     */
    createOrder(payload: CreateOrderRequest): Observable<OrderResponse> {
        return this.http.post<OrderResponse>(this.baseUrl, payload).pipe(
            catchError(this.handleError)
        );
    }

    /**
     * Get user's order history
     * GET /api/orders
     */
    getOrders(): Observable<OrderHistoryResponse> {
        return this.http.get<OrderHistoryResponse>(this.baseUrl).pipe(
            catchError(this.handleError)
        );
    }

    /**
     * Get single order details
     * GET /api/orders/:id
     */
    getOrder(orderId: string): Observable<OrderDetailedResponse> {
        return this.http.get<OrderDetailedResponse>(`${this.baseUrl}/${orderId}`).pipe(
            catchError(this.handleError)
        );
    }

    /**
     * Handle HTTP errors
     */
    private handleError(error: any): Observable<never> {
        const errorMessage = error.error?.message || error.message || 'An error occurred';
        return throwError(() => error);
    }
}
