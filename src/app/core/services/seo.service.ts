import { Injectable, Inject } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';

export interface SeoConfig {
  title: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  locale?: string;
}

@Injectable({
  providedIn: 'root',
})
export class SeoService {
  constructor(
    private titleService: Title,
    private metaService: Meta,
    @Inject(DOCUMENT) private doc: Document,
  ) {}

  public setSeoData(config: SeoConfig): void {
    this.setTitle(config.title);
    this.setMetaTags(config);
    if (config.url) {
      this.setCanonicalUrl(config.url);
    }
  }

  public setTitle(title: string): void {
    this.titleService.setTitle(`${title} | Soukna Masry`);
  }

  public setMetaTags(config: SeoConfig): void {
    if (config.description) {
      this.metaService.updateTag({ name: 'description', content: config.description });
      this.metaService.updateTag({ property: 'og:description', content: config.description });
      this.metaService.updateTag({ name: 'twitter:description', content: config.description });
    }

    if (config.keywords) {
      this.metaService.updateTag({ name: 'keywords', content: config.keywords });
    }

    this.metaService.updateTag({ property: 'og:title', content: config.title });
    this.metaService.updateTag({ name: 'twitter:title', content: config.title });

    if (config.image) {
      this.metaService.updateTag({ property: 'og:image', content: config.image });
      this.metaService.updateTag({ name: 'twitter:image', content: config.image });
      this.metaService.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    }

    if (config.url) {
      this.metaService.updateTag({ property: 'og:url', content: config.url });
    }

    if (config.type) {
      this.metaService.updateTag({ property: 'og:type', content: config.type });
    } else {
      this.metaService.updateTag({ property: 'og:type', content: 'website' });
    }

    // Default locale could be injected or passed, usually 'en_US' or 'ar_EG'
    const locale = config.locale || 'en_US';
    this.metaService.updateTag({ property: 'og:locale', content: locale });
  }

  public setCanonicalUrl(url: string): void {
    let link: HTMLLinkElement = this.doc.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!link) {
      link = this.doc.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.doc.head.appendChild(link);
    }
    // Ensure absolute URL
    if (!url.startsWith('http')) {
      // Assuming base url is the current origin if not provided, or a specific domain
      // For canonical, it's better to be explicit.
      // I will use document.location.origin if available, but for SSR it might differ.
      // For now, I'll assume the caller passes a full URL or I prepend the production domain.
      // Since I don't know the exact prod domain, I'll just set what is passed.
    }
    link.setAttribute('href', url);
  }

  public setJsonLd(data: any): void {
    let script: HTMLScriptElement = this.doc.querySelector(
      'script[type="application/ld+json"]',
    ) as HTMLScriptElement;
    if (!script) {
      script = this.doc.createElement('script');
      script.setAttribute('type', 'application/ld+json');
      this.doc.head.appendChild(script);
    }
    script.text = JSON.stringify(data);
  }
}
