import { Component, inject, OnInit, computed, signal, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterLink } from "@angular/router";
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CartService } from '../../../features/cart/services/cart.service';
import { CartStateService } from '../../../features/cart/services/cart-state.service';
import { FavouritesService } from '../../../features/favourites/services/favourites.service';
import { FavouritesStateService } from '../../../features/favourites/services/favourites-state.service';
import { AuthService } from '../../../features/auth/services/auth.service';
import { ToastService } from '../../services/toast.service';

/**
 * Header Component
 * Responsibilities:
 * - Display navigation menu
 * - Handle language switching
 * - Display cart item count
 * - Handle user logout
 */
@Component({
  selector: 'app-header',
  imports: [RouterLink, FormsModule, TranslateModule, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header implements OnInit {
  private translateService = inject(TranslateService);
  private cartService = inject(CartService);
  private cartState = inject(CartStateService);
  private favouritesService = inject(FavouritesService);
  private favouritesState = inject(FavouritesStateService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);

  // Get cart item count from state
  cartItemCount = this.cartState.itemCount;

  // Get favourites count from state
  favouritesCount = this.favouritesState.count;

  // Check if user is logged in
  isLoggedIn = computed(() => !!this.authService.token());

  // Profile link based on login status
  profileLink = computed(() => this.isLoggedIn() ? '/user/profile' : '/auth/login');

  // Logout loading state
  loggingOut = signal(false);

  // Current language for template access
  get currentLang(): string {
    return this.translateService.currentLang;
  }

  ngOnInit(): void {
    // Load cart and favourites if user is authenticated
    if (this.authService.token()) {
      this.cartService.getCart().subscribe();
      this.favouritesService.getFavourites().subscribe();
    }
  }

  changeLang(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.translateService.use(select.value);
  }

  logout(): void {
    this.loggingOut.set(true);
    this.authService.logout().subscribe({
      next: () => {
        this.loggingOut.set(false);
        this.cartState.clearCart();
        this.favouritesState.clearFavourites();
        this.toast.successT('AUTH.MESSAGES.LOGOUT_SUCCESS');
        this.router.navigate(['/']);
      },
      error: () => {
        this.loggingOut.set(false);
        this.router.navigate(['/']);
      }
    });
  }
}
