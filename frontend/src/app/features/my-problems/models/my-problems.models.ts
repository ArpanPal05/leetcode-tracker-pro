import { PagedResponse } from '../../../core/models/api-response.model';
import { ProblemStatus, UserProblemResponse } from '../../tracker/models/tracker.models';

export interface UserProblemFilter {
  search?: string;
  status?: ProblemStatus | null;
  language?: string | null;
  favorite?: boolean | null;
  page?: number;
  size?: number;
  [key: string]: unknown;
}

export interface UserProblemUpdateRequest {
  status?: ProblemStatus | null;
  notes?: string | null;
  language?: string | null;
  time_taken_minutes?: number | null;
  solution_url?: string | null;
  favorite?: boolean | null;
}

export { ProblemStatus };
export type { PagedResponse, UserProblemResponse };
