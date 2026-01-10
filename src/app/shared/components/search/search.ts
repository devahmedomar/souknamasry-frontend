import { Component, OnInit, signal, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, switchMap, Subject } from 'rxjs';
import { ProductsService } from '../../../features/products/services/products.service';
import { AutocompleteSuggestion } from '../../models/product.interface';
import { TranslateModule } from '@ngx-translate/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './search.html',
  styleUrls: ['./search.css']
})
export class SearchComponent implements OnInit {
  private productsService = inject(ProductsService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  searchQuery = signal<string>('');
  suggestions = signal<AutocompleteSuggestion[]>([]);
  showSuggestions = signal<boolean>(false);
  loading = signal<boolean>(false);

  private searchSubject = new Subject<string>();

  ngOnInit(): void {
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((query) => {
          if (query && query.length >= 2) {
            this.loading.set(true);
            return this.productsService.getAutocompleteSuggestions(query, 10);
          }
          this.suggestions.set([]);
          this.showSuggestions.set(false);
          this.loading.set(false);
          return [];
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: any) => {
          console.log('Autocomplete response:', response);
          this.loading.set(false);
          if (response && response.data && response.data.suggestions) {
            this.suggestions.set(response.data.suggestions);
            this.showSuggestions.set(response.data.suggestions.length > 0);
          } else {
            this.suggestions.set([]);
            this.showSuggestions.set(false);
          }
        },
        error: (error) => {
          console.error('Autocomplete error:', error);
          this.loading.set(false);
          this.suggestions.set([]);
          this.showSuggestions.set(false);
        }
      });
  }

  onSearchInput(value: string): void {
    this.searchQuery.set(value);
    this.searchSubject.next(value);
  }

  onSearch(): void {
    const query = this.searchQuery();
    if (!query || query.trim() === '') return;

    this.showSuggestions.set(false);
    this.router.navigate(['/search'], { queryParams: { q: query.trim() } });
  }

  onSuggestionClick(suggestion: AutocompleteSuggestion): void {
    this.router.navigate(['/product', suggestion.slug]);
    this.showSuggestions.set(false);
    this.searchQuery.set('');
  }

  onBlur(): void {
    setTimeout(() => {
      this.showSuggestions.set(false);
    }, 200);
  }

  onFocus(): void {
    if (this.suggestions().length > 0 && this.searchQuery().length >= 2) {
      this.showSuggestions.set(true);
    }
  }
}
