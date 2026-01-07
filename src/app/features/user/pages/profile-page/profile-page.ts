import { Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ProfileService } from '../../services/profile.service';
import { AddressService, CreateAddressRequest } from '../../services/address.service';
import { OrderService } from '../../../cart/services/order.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { User, UpdateProfileRequest } from '../../../../shared/models/user.interface';
import { Address } from '../../../../shared/models/address.interface';
import { OrderHistoryItem, OrderDetailed } from '../../../../shared/models/order.interface';
import { ProfileSkeleton, AddressCardSkeleton, OrderCardSkeleton } from '../../../../shared/components/skeletons';

@Component({
    selector: 'app-profile-page',
    imports: [CommonModule, ReactiveFormsModule, TranslateModule, ProfileSkeleton, AddressCardSkeleton, OrderCardSkeleton],
    templateUrl: './profile-page.html',
    styleUrl: './profile-page.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfilePage implements OnInit {
    private fb = inject(FormBuilder);
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private profileService = inject(ProfileService);
    private addressService = inject(AddressService);
    private orderService = inject(OrderService);
    private toast = inject(ToastService);
    private translate = inject(TranslateService);

    // Return URL for redirecting after address save (when coming from cart)
    private returnUrl = signal<string | null>(null);

    user = signal<User | null>(null);
    addresses = signal<Address[]>([]);
    orders = signal<OrderHistoryItem[]>([]);
    selectedOrder = signal<OrderDetailed | null>(null);
    isLoading = signal(true);
    isProfileLoading = signal(false);
    isAddressLoading = signal(false);
    isOrdersLoading = signal(false);
    isOrderDetailLoading = signal(false);

    activeTab = signal<'profile' | 'addresses' | 'orders'>('profile');
    isEditingProfile = signal(false);
    showAddressModal = signal(false);
    showOrderDetailModal = signal(false);
    editingAddressId = signal<string | null>(null);

    profileForm: FormGroup = this.fb.group({
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        phone: [''],
        city: ['']
    });

    addressForm: FormGroup = this.fb.group({
        name: ['', Validators.required],
        phone: ['', Validators.required],
        city: ['', Validators.required],
        area: ['', Validators.required],
        street: ['', Validators.required],
        landmark: [''],
        apartmentNumber: [''],
        isDefault: [false]
    });

    ngOnInit() {
        this.loadProfile();
        this.loadAddresses();

        // Check for tab query parameter
        this.route.queryParams.subscribe(params => {
            const tab = params['tab'];
            if (tab === 'addresses' || tab === 'orders' || tab === 'profile') {
                this.activeTab.set(tab);

                // Auto-open address modal if redirected from cart with no addresses
                if (tab === 'addresses' && params['action'] === 'add') {
                    this.openAddressModal();
                }

                // Load orders if redirected to orders tab
                if (tab === 'orders') {
                    this.loadOrders();
                }
            }

            // Store return URL for redirecting after address save
            if (params['returnUrl']) {
                this.returnUrl.set(params['returnUrl']);
            }
        });
    }

    loadOrders() {
        this.isOrdersLoading.set(true);
        this.orderService.getOrders().subscribe({
            next: (response) => {
                this.orders.set(response.data);
                this.isOrdersLoading.set(false);
            },
            error: (err) => {
                this.isOrdersLoading.set(false);
                this.toast.errorT('COMMON.ERROR_OCCURRED');
                console.error('Error loading orders', err);
            }
        });
    }

    viewOrderDetails(orderId: string) {
        this.isOrderDetailLoading.set(true);
        this.orderService.getOrder(orderId).subscribe({
            next: (response) => {
                this.selectedOrder.set(response.data);
                this.showOrderDetailModal.set(true);
                this.isOrderDetailLoading.set(false);
            },
            error: (err) => {
                this.isOrderDetailLoading.set(false);
                this.toast.errorT('COMMON.ERROR_OCCURRED');
                console.error('Error loading order details', err);
            }
        });
    }

    closeOrderDetailModal() {
        this.showOrderDetailModal.set(false);
        this.selectedOrder.set(null);
    }

    getStatusClass(status: string): string {
        switch (status) {
            case 'pending':
                return 'bg-warning';
            case 'confirmed':
            case 'processing':
                return 'bg-info';
            case 'shipped':
                return 'bg-primary';
            case 'delivered':
                return 'bg-success';
            case 'cancelled':
                return 'bg-danger';
            default:
                return 'bg-secondary';
        }
    }

    getPaymentStatusClass(status: string): string {
        switch (status) {
            case 'pending':
                return 'bg-warning';
            case 'paid':
                return 'bg-success';
            case 'failed':
                return 'bg-danger';
            case 'refunded':
                return 'bg-info';
            default:
                return 'bg-secondary';
        }
    }

    loadProfile() {
        this.isLoading.set(true);
        this.profileService.getProfile().subscribe({
            next: (response) => {
                this.user.set(response.data);
                this.profileForm.patchValue({
                    firstName: response.data.firstName,
                    lastName: response.data.lastName,
                    phone: response.data.phone || '',
                    city: response.data.city || ''
                });
                this.isLoading.set(false);
            },
            error: (err) => {
                this.isLoading.set(false);
                this.toast.errorT('COMMON.ERROR_OCCURRED');
                console.error('Error loading profile', err);
            }
        });
    }

    loadAddresses() {
        this.addressService.getAddresses().subscribe({
            next: (response) => {
                this.addresses.set(response.data);
            },
            error: (err) => {
                console.error('Error loading addresses', err);
            }
        });
    }

    setActiveTab(tab: 'profile' | 'addresses' | 'orders') {
        this.activeTab.set(tab);
    }

    toggleEditProfile() {
        this.isEditingProfile.update(v => !v);
    }

    saveProfile() {
        if (this.profileForm.valid) {
            this.isProfileLoading.set(true);
            const data: UpdateProfileRequest = this.profileForm.value;

            this.profileService.updateProfile(data).subscribe({
                next: (response) => {
                    this.user.set(response.data);
                    this.isProfileLoading.set(false);
                    this.isEditingProfile.set(false);
                    this.toast.successT('ACCOUNT.PROFILE_UPDATED');
                },
                error: (err) => {
                    this.isProfileLoading.set(false);
                    this.toast.errorT('COMMON.ERROR_OCCURRED');
                    console.error('Error updating profile', err);
                }
            });
        } else {
            this.profileForm.markAllAsTouched();
        }
    }

    openAddressModal(address?: Address) {
        if (address) {
            this.editingAddressId.set(address._id || null);
            this.addressForm.patchValue({
                name: address.name,
                phone: address.phone,
                city: address.city,
                area: address.area,
                street: address.street,
                landmark: address.landmark || '',
                apartmentNumber: address.apartmentNumber || '',
                isDefault: address.isDefault || false
            });
        } else {
            this.editingAddressId.set(null);
            this.addressForm.reset({ isDefault: false });
        }
        this.showAddressModal.set(true);
    }

    closeAddressModal() {
        this.showAddressModal.set(false);
        this.editingAddressId.set(null);
        this.addressForm.reset({ isDefault: false });
    }

    saveAddress() {
        if (this.addressForm.valid) {
            this.isAddressLoading.set(true);
            const data: CreateAddressRequest = this.addressForm.value;
            const editId = this.editingAddressId();

            const request$ = editId
                ? this.addressService.updateAddress(editId, data)
                : this.addressService.createAddress(data);

            request$.subscribe({
                next: () => {
                    this.isAddressLoading.set(false);
                    this.closeAddressModal();
                    this.loadAddresses();
                    this.toast.successT(editId ? 'ADDRESSES.ADDRESS_UPDATED' : 'ADDRESSES.ADDRESS_ADDED');

                    // Redirect to return URL if coming from cart (only for new addresses)
                    const returnUrl = this.returnUrl();
                    if (!editId && returnUrl) {
                        this.returnUrl.set(null);
                        this.router.navigateByUrl(returnUrl);
                    }
                },
                error: (err) => {
                    this.isAddressLoading.set(false);
                    this.toast.errorT('COMMON.ERROR_OCCURRED');
                    console.error('Error saving address', err);
                }
            });
        } else {
            this.addressForm.markAllAsTouched();
        }
    }

    deleteAddress(id: string) {
        if (confirm(this.translate.instant('ADDRESSES.CONFIRM_DELETE'))) {
            this.addressService.deleteAddress(id).subscribe({
                next: () => {
                    this.loadAddresses();
                    this.toast.successT('ADDRESSES.ADDRESS_DELETED');
                },
                error: (err) => {
                    this.toast.errorT('COMMON.ERROR_OCCURRED');
                    console.error('Error deleting address', err);
                }
            });
        }
    }

    setDefaultAddress(id: string) {
        this.addressService.updateAddress(id, { isDefault: true }).subscribe({
            next: () => {
                this.loadAddresses();
                this.toast.successT('ADDRESSES.ADDRESS_UPDATED');
            },
            error: (err) => {
                this.toast.errorT('COMMON.ERROR_OCCURRED');
                console.error('Error setting default address', err);
            }
        });
    }
}
