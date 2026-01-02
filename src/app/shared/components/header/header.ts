import { Component, inject, OnInit, computed } from '@angular/core';
import { RouterLink } from "@angular/router";
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CartService } from '../../../features/cart/services/cart.service';
import { CartStateService } from '../../../features/cart/services/cart-state.service';
import { AuthService } from '../../../features/auth/services/auth.service';

/**
 * Header Component
 * Responsibilities:
 * - Display navigation menu
 * - Handle language switching
 * - Display cart item count
 */
@Component({
  selector: 'app-header',
  imports: [RouterLink, FormsModule, TranslateModule, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit {
  private translateService = inject(TranslateService);
  private cartService = inject(CartService);
  private cartState = inject(CartStateService);
  private authService = inject(AuthService);

  // Get cart item count from state
  cartItemCount = this.cartState.itemCount;

  // Check if user is logged in
  isLoggedIn = computed(() => !!this.authService.token());

  // Profile link based on login status
  profileLink = computed(() => this.isLoggedIn() ? '/user/profile' : '/auth/login');

  // Current language for template access
  get currentLang(): string {
    return this.translateService.currentLang;
  }

  ngOnInit(): void {
    // Load cart if user is authenticated
    if (this.authService.token()) {
      this.cartService.getCart().subscribe();
    }
  }

  changeLang(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.translateService.use(select.value);
  }
}
