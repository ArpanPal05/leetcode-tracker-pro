import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../../../core/constants/api-endpoints.constants';
import { PagedResponse } from '../../../core/models/api-response.model';
import { ApiService } from '../../../core/services/api.service';
import {
  UserProblemFilter,
  UserProblemResponse,
  UserProblemUpdateRequest
} from '../models/my-problems.models';

@Injectable({
  providedIn: 'root'
})
export class MyProblemsService {
  private apiService = inject(ApiService);

  getUserProblems(
    filter: UserProblemFilter
  ): Observable<PagedResponse<UserProblemResponse>> {
    const params: Record<string, unknown> = {};
    if (filter.search) params['search'] = filter.search;
    if (filter.status) params['status'] = filter.status;
    if (filter.language) params['language'] = filter.language;
    if (filter.favorite !== null && filter.favorite !== undefined) {
      params['favorite'] = filter.favorite;
    }
    if (filter.page) params['page'] = filter.page;
    if (filter.size) params['size'] = filter.size;

    return this.apiService.get<PagedResponse<UserProblemResponse>>(
      API_ENDPOINTS.USER_PROBLEMS.BASE,
      params
    );
  }

  getUserProblemById(id: number): Observable<UserProblemResponse> {
    return this.apiService.get<UserProblemResponse>(
      `${API_ENDPOINTS.USER_PROBLEMS.BASE}/${id}`
    );
  }

  updateUserProblem(
    id: number,
    data: UserProblemUpdateRequest
  ): Observable<UserProblemResponse> {
    return this.apiService.patch<UserProblemResponse>(
      `${API_ENDPOINTS.USER_PROBLEMS.BASE}/${id}`,
      data
    );
  }

  deleteUserProblem(id: number): Observable<void> {
    return this.apiService.delete<void>(
      `${API_ENDPOINTS.USER_PROBLEMS.BASE}/${id}`
    );
  }

  toggleFavorite(id: number): Observable<UserProblemResponse> {
    return this.apiService.post<UserProblemResponse>(
      `${API_ENDPOINTS.USER_PROBLEMS.BASE}/${id}/favorite`,
      {}
    );
  }
}
