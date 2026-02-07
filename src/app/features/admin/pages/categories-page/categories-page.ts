import { Component, inject, OnInit, signal, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';
import {
  CategoryAdminService,
  Category,
  CreateCategoryDto,
  UpdateCategoryDto,
} from '../../services/category-admin.service';

@Component({
  selector: 'app-categories-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    TextareaModule,
    SelectModule,
    CheckboxModule,
    ToastModule,
    ConfirmDialogModule,
    TagModule,
    TooltipModule,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './categories-page.html',
  styleUrl: './categories-page.css',
})
export class CategoriesPage implements OnInit {
  private readonly categoryService = inject(CategoryAdminService);
  private readonly fb = inject(FormBuilder);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly platformId = inject(PLATFORM_ID);

  categories = signal<Category[]>([]);
  loading = signal(false);
  dialogVisible = signal(false);
  isEditMode = signal(false);
  selectedCategory = signal<Category | null>(null);

  categoryForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    nameAr: ['', [Validators.maxLength(100)]],
    description: ['', [Validators.maxLength(500)]],
    descriptionAr: ['', [Validators.maxLength(500)]],
    image: [''],
    parent: [null],
    isActive: [true],
  });

  parentCategories = signal<Category[]>([]);

  ngOnInit(): void {
    // Only load categories in browser (not during SSR)
    if (isPlatformBrowser(this.platformId)) {
      this.loadCategories();
    }
  }

  loadCategories(): void {
    this.loading.set(true);
    this.categoryService.getAllCategories().subscribe({
      next: (response) => {
        const categories = response.data.categories || [];
        this.categories.set(categories);
        // Filter parent categories (categories without parent)
        this.parentCategories.set(
          categories.filter((cat) => !cat.parent)
        );
        this.loading.set(false);
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load categories',
        });
        this.loading.set(false);
      },
    });
  }

  openCreateDialog(): void {
    this.isEditMode.set(false);
    this.selectedCategory.set(null);
    this.categoryForm.reset({ isActive: true });
    this.dialogVisible.set(true);
  }

  openEditDialog(category: Category): void {
    this.isEditMode.set(true);
    this.selectedCategory.set(category);
    this.categoryForm.patchValue({
      name: category.name,
      nameAr: category.nameAr || '',
      description: category.description || '',
      descriptionAr: category.descriptionAr || '',
      image: category.image || '',
      parent: typeof category.parent === 'object' ? category.parent?._id : category.parent,
      isActive: category.isActive,
    });
    this.dialogVisible.set(true);
  }

  closeDialog(): void {
    this.dialogVisible.set(false);
    this.categoryForm.reset();
    this.selectedCategory.set(null);
  }

  saveCategory(): void {
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }

    const formValue = this.categoryForm.value;

    if (this.isEditMode() && this.selectedCategory()) {
      // Update existing category
      const updateData: UpdateCategoryDto = {
        name: formValue.name,
        nameAr: formValue.nameAr || undefined,
        description: formValue.description || undefined,
        descriptionAr: formValue.descriptionAr || undefined,
        image: formValue.image || undefined,
        parent: formValue.parent || undefined,
        isActive: formValue.isActive,
      };

      this.categoryService
        .updateCategory(this.selectedCategory()!._id, updateData)
        .subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Category updated successfully',
            });
            this.loadCategories();
            this.closeDialog();
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.error?.message || 'Failed to update category',
            });
          },
        });
    } else {
      // Create new category
      const createData: CreateCategoryDto = {
        name: formValue.name,
        nameAr: formValue.nameAr || undefined,
        description: formValue.description || undefined,
        descriptionAr: formValue.descriptionAr || undefined,
        image: formValue.image || undefined,
        parent: formValue.parent || undefined,
        isActive: formValue.isActive,
      };

      this.categoryService.createCategory(createData).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Category created successfully',
          });
          this.loadCategories();
          this.closeDialog();
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error?.message || 'Failed to create category',
          });
        },
      });
    }
  }

  toggleCategoryStatus(category: Category): void {
    const action = category.isActive ? 'deactivate' : 'activate';
    const actionText = category.isActive ? 'Deactivate' : 'Activate';

    this.confirmationService.confirm({
      message: `Are you sure you want to ${action} "${category.name}"?`,
      header: `${actionText} Category`,
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const request = category.isActive
          ? this.categoryService.deactivateCategory(category._id)
          : this.categoryService.activateCategory(category._id);

        request.subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: `Category ${action}d successfully`,
            });
            this.loadCategories();
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.error?.message || `Failed to ${action} category`,
            });
          },
        });
      },
    });
  }

  deleteCategory(category: Category): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${category.name}"? This action cannot be undone.`,
      header: 'Delete Category',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.categoryService.deleteCategory(category._id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Category deleted successfully',
            });
            this.loadCategories();
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail:
                error.error?.message ||
                'Failed to delete category. It may have associated products or subcategories.',
            });
          },
        });
      },
    });
  }

  getParentName(category: Category): string {
    if (!category.parent) return '-';
    return typeof category.parent === 'object'
      ? category.parent.name
      : 'Unknown';
  }
}
