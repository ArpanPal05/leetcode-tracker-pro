export interface UserProfile {
  id: number;
  email: string;
  username?: string;
  full_name?: string;
  created_at?: string;
}

export interface UserStatistics {
  total_tracked: number;
  total_solved: number;
  current_streak: number;
  longest_streak: number;
  favorite_count?: number;
}

export interface UserPreferences {
  theme: 'dark' | 'light';
  language: string;
  defaultStatus: string;
  notifications: boolean;
}

export interface ChangePasswordRequest {
  current_password?: string;
  new_password: string;
  confirm_password: string;
}

export interface UpdateProfileRequest {
  full_name?: string;
  email?: string;
}
