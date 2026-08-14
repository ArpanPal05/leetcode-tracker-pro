import { ApiResponse } from '../../../core/models/api-response.model';

export enum ProblemStatus {
  NOT_STARTED = 'NOT_STARTED',
  ATTEMPTING = 'ATTEMPTING',
  SOLVED = 'SOLVED',
  NEEDS_REVISION = 'NEEDS_REVISION',
  MASTERED = 'MASTERED'
}

export interface UserProblemTrackRequest {
  leetcode_url: string;
  status: ProblemStatus;
  notes?: string | null;
  language?: string | null;
  time_taken_minutes?: number | null;
  solution_url?: string | null;
  favorite?: boolean;
}

export interface TrackedProblemMeta {
  id: number;
  title: string;
  title_slug: string;
  difficulty: string;
  leetcode_url: string;
}

export interface UserProblemResponse {
  id: number;
  user_id: number;
  problem_id: number;
  status: ProblemStatus;
  notes?: string | null;
  language?: string | null;
  time_taken_minutes?: number | null;
  revision_count: number;
  favorite: boolean;
  solution_url?: string | null;
  solved_at?: string | null;
  first_attempted_at: string;
  created_at: string;
  problem?: TrackedProblemMeta;
}
