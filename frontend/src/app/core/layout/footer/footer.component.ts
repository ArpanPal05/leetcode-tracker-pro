import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `<footer class="footer"><p>Footer Placeholder</p></footer>`,
  styles: [`
    .footer {
      padding: 1rem;
      text-align: center;
      background-color: #0f172a;
      border-top: 1px solid #334155;
    }
  `]
})
export class FooterComponent {}
