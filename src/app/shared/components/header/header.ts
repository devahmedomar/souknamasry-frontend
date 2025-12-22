import { Component, inject } from '@angular/core';
import { RouterLink } from "@angular/router";
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-header',
  imports: [RouterLink, FormsModule, TranslateModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  translate = inject(TranslateService);

  changeLang(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.translate.use(select.value);
  }
}
