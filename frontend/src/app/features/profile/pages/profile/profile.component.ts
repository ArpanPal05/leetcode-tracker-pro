import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ChangePasswordDialogComponent } from '../../components/change-password-dialog/change-password-dialog.component';
import { EmptyStateComponent } from '../../components/empty-state/empty-state.component';
import { LoadingStateComponent } from '../../components/loading-state/loading-state.component';
import { LogoutCardComponent } from '../../components/logout-card/logout-card.component';
import { PreferencesPanelComponent } from '../../components/preferences-panel/preferences-panel.component';
import { ProfileCardComponent } from '../../components/profile-card/profile-card.component';
import { ProfileInformationComponent } from '../../components/profile-information/profile-information.component';
import { StatisticsSummaryComponent } from '../../components/statistics-summary/statistics-summary.component';
import { UpdateProfileRequest, UserPreferences } from '../../models/profile.models';
import { ProfileStore } from '../../store/profile.store';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    ProfileCardComponent,
    StatisticsSummaryComponent,
    ProfileInformationComponent,
    PreferencesPanelComponent,
    LogoutCardComponent,
    LoadingStateComponent,
    EmptyStateComponent
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  readonly profileStore = inject(ProfileStore);
  private dialog = inject(MatDialog);

  ngOnInit(): void {
    this.profileStore.loadProfileData();
  }

  onUpdateProfile(data: UpdateProfileRequest): void {
    this.profileStore.updateProfile(data);
  }

  onUpdatePreferences(prefs: UserPreferences): void {
    this.profileStore.updatePreferences(prefs);
  }

  onChangePassword(): void {
    this.dialog.open(ChangePasswordDialogComponent, {
      width: '440px'
    });
  }
}
