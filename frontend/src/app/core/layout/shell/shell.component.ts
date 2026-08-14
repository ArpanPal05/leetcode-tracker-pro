import { BreakpointObserver } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { LoadingService } from '../../services/loading.service';
import { NavbarComponent } from '../navbar/navbar.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatSidenavModule,
    MatProgressBarModule,
    NavbarComponent,
    SidebarComponent
  ],
  template: `
    <div class="shell-wrapper">
      <!-- Navbar at Top -->
      <app-navbar (toggleSidebar)="toggleSidenav()" />

      <!-- Sidenav Container -->
      <mat-sidenav-container class="shell-sidenav-container" autosize>
        <!-- Sidebar Sidenav Drawer -->
        <mat-sidenav
          #sidenav
          [mode]="isMobile() ? 'over' : 'side'"
          [opened]="isMobile() ? false : true"
          class="shell-sidenav"
        >
          <app-sidebar (navClicked)="onNavClicked()" />
        </mat-sidenav>

        <!-- Main Content Area -->
        <mat-sidenav-content class="shell-sidenav-content">
          <!-- Global Loading Indicator -->
          <mat-progress-bar
            *ngIf="loadingService.isLoading()"
            mode="indeterminate"
            color="primary"
            class="global-progress-bar"
          ></mat-progress-bar>

          <!-- Breadcrumb Placeholder Bar -->
          <div class="breadcrumb-bar">
            <span class="breadcrumb-root">App</span>
            <span class="breadcrumb-separator">/</span>
            <span class="breadcrumb-current">{{ currentBreadcrumb() }}</span>
          </div>

          <!-- Page Component Container -->
          <div class="page-container">
            <router-outlet />
          </div>
        </mat-sidenav-content>
      </mat-sidenav-container>
    </div>
  `,
  styles: [`
    .shell-wrapper {
      display: flex;
      flex-direction: column;
      height: 100vh;
      width: 100vw;
      overflow: hidden;
      background-color: #0f172a;
    }

    .shell-sidenav-container {
      flex: 1;
      background-color: #0f172a;
    }

    .shell-sidenav {
      width: 250px;
      border-right: 1px solid #334155 !important;
      background-color: #1e293b !important;
    }

    .shell-sidenav-content {
      display: flex;
      flex-direction: column;
      height: 100%;
      background-color: #0f172a;
      position: relative;
    }

    .global-progress-bar {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      z-index: 50;
      height: 4px;
    }

    .breadcrumb-bar {
      padding: 0.75rem 1.5rem;
      background-color: #1e293b;
      border-bottom: 1px solid #334155;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.8125rem;
      color: #94a3b8;

      .breadcrumb-root {
        color: #64748b;
      }
      .breadcrumb-separator {
        color: #475569;
      }
      .breadcrumb-current {
        color: #3b82f6;
        font-weight: 600;
        text-transform: capitalize;
      }
    }

    .page-container {
      flex: 1;
      padding: 1.5rem;
      overflow-y: auto;
    }
  `]
})
export class ShellComponent implements OnInit {
  @ViewChild('sidenav') sidenav!: MatSidenav;

  private breakpointObserver = inject(BreakpointObserver);
  private router = inject(Router);
  readonly loadingService = inject(LoadingService);

  readonly isMobile = signal<boolean>(false);
  readonly currentBreadcrumb = signal<string>('Dashboard');

  ngOnInit(): void {
    // Responsive Breakpoint Observer (Mobile/Tablet < 992px)
    this.breakpointObserver
      .observe(['(max-width: 991px)'])
      .subscribe((result) => {
        this.isMobile.set(result.matches);
      });

    // Update Breadcrumb on route change
    this.updateBreadcrumb(this.router.url);
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.updateBreadcrumb(event.urlAfterRedirects);
      });
  }

  toggleSidenav(): void {
    this.sidenav.toggle();
  }

  onNavClicked(): void {
    if (this.isMobile() && this.sidenav) {
      this.sidenav.close();
    }
  }

  private updateBreadcrumb(url: string): void {
    const rawPath = url.split('/')[1] || 'dashboard';
    const formatted = rawPath.replace('-', ' ');
    this.currentBreadcrumb.set(formatted);
  }
}
