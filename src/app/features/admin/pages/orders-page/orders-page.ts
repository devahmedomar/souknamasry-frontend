import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { OrderAdminService } from '../../services/order-admin.service';
import {
  Order,
  OrderQueryParams,
  OrderStatus,
  PaymentStatus,
} from '../../models/order.model';

// PrimeNG imports
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { DatePickerModule } from 'primeng/datepicker';
import { MessageService, ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-orders-page',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    DialogModule,
    ToastModule,
    ConfirmDialogModule,
    TagModule,
    TooltipModule,
    DatePickerModule,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './orders-page.html',
  styleUrl: './orders-page.css',
})
export class OrdersPage implements OnInit {
  private readonly orderService = inject(OrderAdminService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  orders = signal<Order[]>([]);
  loading = signal(false);
  showDetailsDialog = signal(false);
  showStatusDialog = signal(false);
  showPaymentDialog = signal(false);
  selectedOrder = signal<Order | null>(null);

  // Pagination
  totalRecords = signal(0);
  currentPage = signal(1);
  rowsPerPage = signal(20);

  // Filters
  searchTerm = '';
  selectedOrderStatus: OrderStatus | null = null;
  selectedPaymentStatus: PaymentStatus | null = null;
  startDate: Date | null = null;
  endDate: Date | null = null;

  // Status for dialogs
  newOrderStatus: OrderStatus = 'pending';
  newPaymentStatus: PaymentStatus = 'pending';

  orderStatusOptions = [
    { label: 'All Status', value: null },
    { label: 'Pending', value: 'pending' },
    { label: 'Processing', value: 'processing' },
    { label: 'Shipped', value: 'shipped' },
    { label: 'Delivered', value: 'delivered' },
    { label: 'Cancelled', value: 'cancelled' },
  ];

  paymentStatusOptions = [
    { label: 'All Payments', value: null },
    { label: 'Pending', value: 'pending' },
    { label: 'Paid', value: 'paid' },
    { label: 'Failed', value: 'failed' },
    { label: 'Refunded', value: 'refunded' },
  ];

  orderStatusSelectOptions = [
    { label: 'Pending', value: 'pending' },
    { label: 'Processing', value: 'processing' },
    { label: 'Shipped', value: 'shipped' },
    { label: 'Delivered', value: 'delivered' },
    { label: 'Cancelled', value: 'cancelled' },
  ];

  paymentStatusSelectOptions = [
    { label: 'Pending', value: 'pending' },
    { label: 'Paid', value: 'paid' },
    { label: 'Failed', value: 'failed' },
    { label: 'Refunded', value: 'refunded' },
  ];

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading.set(true);

    const params: OrderQueryParams = {
      page: this.currentPage(),
      limit: this.rowsPerPage(),
    };

    if (this.searchTerm) {
      params.search = this.searchTerm;
    }
    if (this.selectedOrderStatus) {
      params.status = this.selectedOrderStatus;
    }
    if (this.selectedPaymentStatus) {
      params.paymentStatus = this.selectedPaymentStatus;
    }
    if (this.startDate) {
      params.startDate = this.formatDate(this.startDate);
    }
    if (this.endDate) {
      params.endDate = this.formatDate(this.endDate);
    }

    this.orderService.getAllOrders(params).subscribe({
      next: (response) => {
        this.orders.set(response.data.orders);
        this.totalRecords.set(response.data.pagination.total);
        this.loading.set(false);
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load orders',
        });
        this.loading.set(false);
      },
    });
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  onPageChange(event: any): void {
    this.currentPage.set(event.page + 1);
    this.rowsPerPage.set(event.rows);
    this.loadOrders();
  }

  onSearch(): void {
    this.currentPage.set(1);
    this.loadOrders();
  }

  onFilterChange(): void {
    this.currentPage.set(1);
    this.loadOrders();
  }

  openDetailsDialog(order: Order): void {
    this.selectedOrder.set(order);
    this.showDetailsDialog.set(true);
  }

  openOrderStatusDialog(order: Order): void {
    this.selectedOrder.set(order);
    this.newOrderStatus = order.status;
    this.showStatusDialog.set(true);
  }

  openPaymentStatusDialog(order: Order): void {
    this.selectedOrder.set(order);
    this.newPaymentStatus = order.paymentStatus;
    this.showPaymentDialog.set(true);
  }

  closeDetailsDialog(): void {
    this.showDetailsDialog.set(false);
    this.selectedOrder.set(null);
  }

  closeStatusDialog(): void {
    this.showStatusDialog.set(false);
    this.selectedOrder.set(null);
  }

  closePaymentDialog(): void {
    this.showPaymentDialog.set(false);
    this.selectedOrder.set(null);
  }

  updateOrderStatus(): void {
    const order = this.selectedOrder();
    if (!order) return;

    this.orderService
      .updateOrderStatus(order._id, { status: this.newOrderStatus })
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Order status updated successfully',
          });
          this.closeStatusDialog();
          this.loadOrders();
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error?.message || 'Failed to update order status',
          });
        },
      });
  }

  updatePaymentStatus(): void {
    const order = this.selectedOrder();
    if (!order) return;

    this.orderService
      .updatePaymentStatus(order._id, { paymentStatus: this.newPaymentStatus })
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Payment status updated successfully',
          });
          this.closePaymentDialog();
          this.loadOrders();
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error?.message || 'Failed to update payment status',
          });
        },
      });
  }

  deleteOrder(order: Order): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to permanently delete order ${order.orderNumber}? This action cannot be undone.`,
      header: 'Delete Order',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.orderService.deleteOrder(order._id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Order deleted permanently',
            });
            this.loadOrders();
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.error?.message || 'Failed to delete order',
            });
          },
        });
      },
    });
  }

  getOrderStatusSeverity(status: OrderStatus): 'success' | 'info' | 'warn' | 'danger' {
    const statusMap: Record<OrderStatus, 'success' | 'info' | 'warn' | 'danger'> = {
      delivered: 'success',
      processing: 'info',
      shipped: 'info',
      pending: 'warn',
      cancelled: 'danger',
    };
    return statusMap[status];
  }

  getPaymentStatusSeverity(status: PaymentStatus): 'success' | 'info' | 'warn' | 'danger' {
    const statusMap: Record<PaymentStatus, 'success' | 'info' | 'warn' | 'danger'> = {
      paid: 'success',
      pending: 'warn',
      failed: 'danger',
      refunded: 'info',
    };
    return statusMap[status];
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EGP',
    }).format(amount);
  }

  getFullAddress(order: Order): string {
    const addr = order.shippingAddress;
    return `${addr.street}, ${addr.area}, ${addr.city}${addr.landmark ? ', ' + addr.landmark : ''}${addr.apartmentNumber ? ', Apt ' + addr.apartmentNumber : ''}`;
  }
}
