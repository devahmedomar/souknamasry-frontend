import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  FormArray,
} from '@angular/forms';
import { ProductAdminService } from '../../services/product-admin.service';
import { CategoryAdminService } from '../../services/category-admin.service';
import { Product, ProductQueryParams } from '../../models/product.model';
import { Category } from '../../services/category-admin.service';

// PrimeNG imports
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageService, ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-products-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    TextareaModule,
    SelectModule,
    DialogModule,
    ToastModule,
    ConfirmDialogModule,
    TagModule,
    TooltipModule,
    CheckboxModule,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './products-page.html',
  styleUrl: './products-page.css',
})
export class ProductsPage implements OnInit {
  private readonly productService = inject(ProductAdminService);
  private readonly categoryService = inject(CategoryAdminService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly fb = inject(FormBuilder);

  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  loading = signal(false);
  showDialog = signal(false);
  showStockDialog = signal(false);
  isEditMode = signal(false);
  selectedProduct = signal<Product | null>(null);

  // Pagination
  totalRecords = signal(0);
  currentPage = signal(1);
  rowsPerPage = signal(20);

  // Filters
  searchTerm = signal('');
  selectedCategory = signal<string | null>(null);
  selectedActiveStatus = signal<boolean | null>(null);
  selectedStockStatus = signal<boolean | null>(null);

  activeStatusOptions = [
    { label: 'All Status', value: null },
    { label: 'Active', value: true },
    { label: 'Inactive', value: false },
  ];

  stockStatusOptions = [
    { label: 'All Stock', value: null },
    { label: 'In Stock', value: true },
    { label: 'Out of Stock', value: false },
  ];

  productForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    nameAr: [''],
    description: ['', [Validators.required]],
    descriptionAr: [''],
    price: [0, [Validators.required, Validators.min(0)]],
    category: ['', [Validators.required]],
    stockQuantity: [0, [Validators.required, Validators.min(0)]],
    inStock: [true],
    isActive: [true],
    images: this.fb.array([]),
  });

  stockForm: FormGroup = this.fb.group({
    stockQuantity: [0, [Validators.required, Validators.min(0)]],
  });

  get images(): FormArray {
    return this.productForm.get('images') as FormArray;
  }

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
  }

  loadCategories(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (response) => {
        this.categories.set(response.data.categories || []);
      },
      error: (error) => {
        console.error('Failed to load categories:', error);
      },
    });
  }

  loadProducts(): void {
    this.loading.set(true);

    const params: ProductQueryParams = {
      page: this.currentPage(),
      limit: this.rowsPerPage(),
    };

    if (this.searchTerm()) {
      params.search = this.searchTerm();
    }
    if (this.selectedCategory()) {
      params.category = this.selectedCategory()!;
    }
    if (this.selectedActiveStatus() !== null) {
      params.isActive = this.selectedActiveStatus()!;
    }
    if (this.selectedStockStatus() !== null) {
      params.inStock = this.selectedStockStatus()!;
    }

    this.productService.getAllProducts(params).subscribe({
      next: (response) => {
        this.products.set(response.data.products);
        this.totalRecords.set(response.data.pagination.total);
        this.loading.set(false);
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load products',
        });
        this.loading.set(false);
      },
    });
  }

  onPageChange(event: any): void {
    this.currentPage.set(event.page + 1);
    this.rowsPerPage.set(event.rows);
    this.loadProducts();
  }

  onSearch(): void {
    this.currentPage.set(1);
    this.loadProducts();
  }

  onFilterChange(): void {
    this.currentPage.set(1);
    this.loadProducts();
  }

  openCreateDialog(): void {
    this.isEditMode.set(false);
    this.selectedProduct.set(null);
    this.productForm.reset({
      inStock: true,
      isActive: true,
      price: 0,
      stockQuantity: 0,
    });
    this.images.clear();
    this.addImageField();
    this.showDialog.set(true);
  }

  openEditDialog(product: Product): void {
    this.isEditMode.set(true);
    this.selectedProduct.set(product);
    this.productForm.patchValue({
      name: product.name,
      nameAr: product.nameAr,
      description: product.description,
      descriptionAr: product.descriptionAr,
      price: product.price,
      category: product.category._id,
      stockQuantity: product.stockQuantity,
      inStock: product.inStock,
      isActive: product.isActive,
    });
    this.images.clear();
    product.images.forEach((url) => {
      this.images.push(this.fb.control(url, Validators.required));
    });
    if (this.images.length === 0) {
      this.addImageField();
    }
    this.showDialog.set(true);
  }

  openStockDialog(product: Product): void {
    this.selectedProduct.set(product);
    this.stockForm.patchValue({
      stockQuantity: product.stockQuantity,
    });
    this.showStockDialog.set(true);
  }

  closeDialog(): void {
    this.showDialog.set(false);
    this.productForm.reset();
    this.images.clear();
  }

  closeStockDialog(): void {
    this.showStockDialog.set(false);
    this.stockForm.reset();
  }

  addImageField(): void {
    this.images.push(this.fb.control('', Validators.required));
  }

  removeImageField(index: number): void {
    if (this.images.length > 1) {
      this.images.removeAt(index);
    }
  }

  saveProduct(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    const formValue = this.productForm.value;
    const productData = {
      ...formValue,
      images: formValue.images.filter((url: string) => url.trim() !== ''),
    };

    if (this.isEditMode()) {
      this.productService
        .updateProduct(this.selectedProduct()!._id, productData)
        .subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Product updated successfully',
            });
            this.closeDialog();
            this.loadProducts();
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.error?.message || 'Failed to update product',
            });
          },
        });
    } else {
      this.productService.createProduct(productData).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Product created successfully',
          });
          this.closeDialog();
          this.loadProducts();
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error?.message || 'Failed to create product',
          });
        },
      });
    }
  }

  updateStock(): void {
    if (this.stockForm.invalid) {
      this.stockForm.markAllAsTouched();
      return;
    }

    const stockData = this.stockForm.value;
    this.productService
      .updateProductStock(this.selectedProduct()!._id, stockData)
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Stock updated successfully',
          });
          this.closeStockDialog();
          this.loadProducts();
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error?.message || 'Failed to update stock',
          });
        },
      });
  }

  toggleProductActive(product: Product): void {
    const action = product.isActive ? 'deactivate' : 'activate';
    const message = product.isActive
      ? 'Are you sure you want to deactivate this product?'
      : 'Are you sure you want to activate this product?';

    this.confirmationService.confirm({
      message,
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.productService
          .toggleProductActive(product._id, { isActive: !product.isActive })
          .subscribe({
            next: () => {
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: `Product ${action}d successfully`,
              });
              this.loadProducts();
            },
            error: (error) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: `Failed to ${action} product`,
              });
            },
          });
      },
    });
  }

  deleteProduct(product: Product): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to permanently delete "${product.name}"? This action cannot be undone.`,
      header: 'Delete Product',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.productService.deleteProduct(product._id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Product deleted permanently',
            });
            this.loadProducts();
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.error?.message || 'Failed to delete product',
            });
          },
        });
      },
    });
  }

  getActiveSeverity(isActive: boolean): 'success' | 'danger' {
    return isActive ? 'success' : 'danger';
  }

  getStockSeverity(inStock: boolean): 'success' | 'danger' {
    return inStock ? 'success' : 'danger';
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EGP',
    }).format(amount);
  }

  getCategoryOptions() {
    return [
      { label: 'All Categories', value: null },
      ...this.categories().map((c) => ({ label: c.name, value: c._id })),
    ];
  }

  getCategorySelectOptions() {
    return this.categories().map((c) => ({ label: c.name, value: c._id }));
  }
}
