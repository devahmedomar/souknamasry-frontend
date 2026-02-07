import { Injectable, signal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class QuickViewService {
  /** Whether the quick view modal is visible */
  visible = signal(false);

  /** Emits the product slug to load */
  private slugSubject = new BehaviorSubject<string | null>(null);
  slug$ = this.slugSubject.asObservable();

  open(slug: string): void {
    this.slugSubject.next(slug);
    this.visible.set(true);
  }

  close(): void {
    this.visible.set(false);
    this.slugSubject.next(null);
  }
}
