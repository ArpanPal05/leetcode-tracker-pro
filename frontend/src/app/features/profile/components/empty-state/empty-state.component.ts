import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-profile-empty-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="empty-box">
      <h3>No Profile Details Available</h3>
      <p>Unable to load user profile information.</p>
    </div>
  `,
  styles: [`
    .empty-box {
      background-color: #1e293b;
      border: 1px solid #334155;
      border-radius: 12px;
      padding: 3rem;
      text-align: center;

      h3 { color: #f8fafc; }
      p { color: #94a3b8; }
    }
  `]
})
export class EmptyStateComponent {}
