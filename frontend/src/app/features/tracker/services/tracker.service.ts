import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../../../core/constants/api-endpoints.constants';
import { ApiResponse } from '../../../core/models/api-response.model';
import { ApiService } from '../../../core/services/api.service';
import { UserProblemResponse, UserProblemTrackRequest } from '../models/tracker.models';

@Injectable({
  providedIn: 'root'
})
export class TrackerService {
  private apiService = inject(ApiService);

  trackProblemByUrl(
    request: UserProblemTrackRequest
  ): Observable<ApiResponse<UserProblemResponse>> {
    return this.apiService.post<ApiResponse<UserProblemResponse>>(
      API_ENDPOINTS.USER_PROBLEMS.TRACK,
      request
    );
  }
}
