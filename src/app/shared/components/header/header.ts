import { Component, inject, OnInit, computed } from '@angular/core';
import { RouterLink } from "@angular/router";
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../../features/cart/services/cart.service';
import { AuthService } from '../../../features/auth/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  imports: [RouterLink, FormsModule, TranslateModule, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit {
  translate = inject(TranslateService);
  private cartService = inject(CartService);
  private authService = inject(AuthService);

  // Computed signal to get cart item count
  cartItemCount = computed(() => this.cartService.cartItemCount());

  ngOnInit(): void {
    // Load cart count if user is authenticated
    if (this.authService.token()) {
      this.cartService.loadCartCount();
    }
  }

  changeLang(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.translate.use(select.value);
  }
}
