import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { RecentActivityItem, TimeStatistics } from '../../models/dashboard.models';

@Component({
  selector: 'app-recent-activity',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: `
    <mat-card class="activity-card">
      <div class="activity-header">
        <h3>Recent Activity</h3>
        <p>Latest 10 problems added to your tracking list</p>
      </div>

      <div *ngIf="activities && activities.length > 0; else noData" class="table-responsive">
        <table class="activity-table">
          <thead>
            <tr>
              <th>Problem Title</th>
              <th>Difficulty</th>
              <th>Status</th>
              <th>Language</th>
              <th>Tracked Date</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of activities">
              <td class="problem-title">{{ item.title }}</td>
              <td>
                <span class="chip-difficulty" [ngClass]="item.difficulty.toLowerCase()">
                  {{ item.difficulty }}
                </span>
              </td>
              <td>
                <span class="badge-status" [ngClass]="item.status.toLowerCase()">
                  {{ item.status }}
                </span>
              </td>
              <td>{{ item.language || 'N/A' }}</td>
              <td>{{ item.tracked_at | date: 'mediumDate' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <ng-template #noData>
        <div class="empty-activity">
          <p>No recent activity found. Start tracking problems to see updates here!</p>
        </div>
      </ng-template>
    </mat-card>
  `,
  styleUrl: './recent-activity.component.scss'
})
export class RecentActivityComponent {
  @Input() activities: RecentActivityItem[] | null = null;
  @Input() timeStats: TimeStatistics | null = null;
}
