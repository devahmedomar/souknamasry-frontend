import {
  Directive,
  ElementRef,
  inject,
  input,
  AfterViewInit,
  OnDestroy,
  Renderer2,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type AnimationType =
  | 'fade-up'
  | 'fade-down'
  | 'fade-in'
  | 'slide-left'
  | 'slide-right'
  | 'zoom-in'
  | 'scale-up';

@Directive({
  selector: '[appScrollAnimate]',
  standalone: true,
})
export class ScrollAnimateDirective implements AfterViewInit, OnDestroy {
  private el = inject(ElementRef);
  private renderer = inject(Renderer2);
  private platformId = inject(PLATFORM_ID);

  /** Animation type */
  animation = input<AnimationType>('fade-up');

  /** Delay in milliseconds before animation starts */
  delay = input<number>(0);

  /** Threshold for triggering (0-1) */
  threshold = input<number>(0.15);

  /** Whether to animate only once */
  once = input<boolean>(true);

  private observer?: IntersectionObserver;
  private hasAnimated = false;

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // Check for reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.renderer.addClass(this.el.nativeElement, 'animate-visible');
      return;
    }

    this.setupElement();
    this.setupObserver();
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  private setupElement(): void {
    const el = this.el.nativeElement;
    // Add base hidden state + type-specific hidden class for correct initial transform
    this.renderer.addClass(el, 'animate-hidden');
    this.renderer.addClass(el, `animate-hidden--${this.animation()}`);
    if (this.delay()) {
      this.renderer.setStyle(el, 'transition-delay', `${this.delay()}ms`);
    }
  }

  private setupObserver(): void {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (this.once() && this.hasAnimated) return;

            this.animateIn();
            this.hasAnimated = true;

            if (this.once()) {
              this.observer?.disconnect();
            }
          } else if (!this.once() && this.hasAnimated) {
            this.animateOut();
          }
        });
      },
      { threshold: this.threshold() }
    );

    this.observer.observe(this.el.nativeElement);
  }

  private animateIn(): void {
    const el = this.el.nativeElement;
    this.renderer.removeClass(el, 'animate-hidden');
    this.renderer.removeClass(el, `animate-hidden--${this.animation()}`);
    this.renderer.addClass(el, `animate-${this.animation()}`);
  }

  private animateOut(): void {
    const el = this.el.nativeElement;
    this.renderer.addClass(el, 'animate-hidden');
    this.renderer.addClass(el, `animate-hidden--${this.animation()}`);
    this.renderer.removeClass(el, `animate-${this.animation()}`);
    this.hasAnimated = false;
  }
}
