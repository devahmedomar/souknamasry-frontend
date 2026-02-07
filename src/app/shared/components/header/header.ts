import { Component, inject, OnInit, OnDestroy, computed, signal, ChangeDetectionStrategy, HostListener, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from "@angular/router";
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CartService } from '../../../features/cart/services/cart.service';
import { CartStateService } from '../../../features/cart/services/cart-state.service';
import { FavouritesService } from '../../../features/favourites/services/favourites.service';
import { FavouritesStateService } from '../../../features/favourites/services/favourites-state.service';
import { AuthService } from '../../../features/auth/services/auth.service';
import { ToastService } from '../../services/toast.service';
import { SearchComponent } from '../search/search';
import { ThemeToggle } from '../theme-toggle/theme-toggle';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, FormsModule, TranslateModule, CommonModule, SearchComponent, ThemeToggle],
  templateUrl: './header.html',
  styleUrl: './header.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header implements OnInit, OnDestroy {
  private translateService = inject(TranslateService);
  private cartService = inject(CartService);
  private cartState = inject(CartStateService);
  private favouritesService = inject(FavouritesService);
  private favouritesState = inject(FavouritesStateService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);
  private platformId = inject(PLATFORM_ID);

  cartItemCount = this.cartState.itemCount;
  favouritesCount = this.favouritesState.count;
  isLoggedIn = computed(() => !!this.authService.token());
  isAdmin = computed(() => {
    const user = this.authService.currentUser();
    return user?.role === 'admin';
  });
  profileLink = computed(() => this.isLoggedIn() ? '/user/profile' : '/auth/login');

  loggingOut = signal(false);
  isScrolled = signal(false);
  drawerOpen = signal(false);
  mobileSearchOpen = signal(false);

  get currentLang(): string {
    return this.translateService.currentLang;
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    const scrollPosition = window.scrollY || document.documentElement.scrollTop;
    this.isScrolled.set(scrollPosition > 50);
  }

  ngOnInit(): void {
    if (this.authService.token()) {
      this.cartService.getCart().subscribe();
      this.favouritesService.getFavourites().subscribe();
    }
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = '';
    }
  }

  toggleDrawer(): void {
    const open = !this.drawerOpen();
    this.drawerOpen.set(open);
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = open ? 'hidden' : '';
    }
  }

  closeDrawer(): void {
    this.drawerOpen.set(false);
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = '';
    }
  }

  toggleMobileSearch(): void {
    this.mobileSearchOpen.set(!this.mobileSearchOpen());
  }

  navigateAndClose(path: string): void {
    this.closeDrawer();
    this.router.navigate([path]);
  }

  changeLang(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const lang = select.value;
    localStorage.setItem('lang', lang);
    this.translateService.use(lang);
  }

  logout(): void {
    this.loggingOut.set(true);
    this.authService.logout().subscribe({
      next: () => {
        this.loggingOut.set(false);
        this.cartState.clearCart();
        this.favouritesState.clearFavourites();
        this.toast.successT('AUTH.MESSAGES.LOGOUT_SUCCESS');
        this.closeDrawer();
        this.router.navigate(['/']);
      },
      error: () => {
        this.loggingOut.set(false);
        this.closeDrawer();
        this.router.navigate(['/']);
      }
    });
  }
}
