import '@angular/compiler';
import { describe, expect, it } from 'vitest';
import { ProblemStatus, UserProblemResponse } from '../../models/my-problems.models';
import { DetailsDialogComponent } from './details-dialog.component';

describe('DetailsDialogComponent', () => {
  const createComponent = (data: Partial<UserProblemResponse>) => {
    const mockDialogRef = { close: () => {} } as any;
    const fullData: UserProblemResponse = {
      id: 1,
      user_id: 1,
      problem_id: 10,
      status: ProblemStatus.SOLVED,
      revision_count: 0,
      favorite: false,
      first_attempted_at: '2026-08-15T12:00:00Z',
      created_at: '2026-08-15T12:00:00Z',
      ...data
    };
    return new DetailsDialogComponent(mockDialogRef, fullData);
  };

  it('should format status correctly', () => {
    const compSolved = createComponent({ status: ProblemStatus.SOLVED });
    expect(compSolved.formattedStatus).toBe('Solved');

    const compNotStarted = createComponent({ status: ProblemStatus.NOT_STARTED });
    expect(compNotStarted.formattedStatus).toBe('Not Started');

    const compAttempting = createComponent({ status: ProblemStatus.ATTEMPTING });
    expect(compAttempting.formattedStatus).toBe('In Progress');

    const compNeedsRevision = createComponent({ status: ProblemStatus.NEEDS_REVISION });
    expect(compNeedsRevision.formattedStatus).toBe('Needs Revision');

    const compMastered = createComponent({ status: ProblemStatus.MASTERED });
    expect(compMastered.formattedStatus).toBe('Mastered');
  });

  it('should format difficulty correctly', () => {
    const compEasy = createComponent({
      problem: { id: 1, title: 'Two Sum', difficulty: 'EASY', platform: 'LeetCode' }
    });
    expect(compEasy.formattedDifficulty).toBe('Easy');

    const compMedium = createComponent({
      problem: { id: 2, title: 'Add Two Numbers', difficulty: 'Medium', platform: 'LeetCode' }
    });
    expect(compMedium.formattedDifficulty).toBe('Medium');

    const compHard = createComponent({
      problem: { id: 3, title: 'Median', difficulty: 'HARD', platform: 'LeetCode' }
    });
    expect(compHard.formattedDifficulty).toBe('Hard');
  });

  it('should clean notes plain text', () => {
    const comp = createComponent({
      notes: '**Use Two Pointers** technique for O(N) time.'
    });
    expect(comp.displayNotes).toBe('Use Two Pointers technique for O(N) time.');
  });

  it('should resolve correct platform URLs', () => {
    const compLC = createComponent({
      problem: { id: 1, title: 'Two Sum', difficulty: 'Easy', platform: 'LeetCode', slug: 'two-sum' }
    });
    expect(compLC.problemUrl).toBe('https://leetcode.com/problems/two-sum/');

    const compCF = createComponent({
      problem: { id: 2, title: 'Watermelon', difficulty: 'Easy', platform: 'Codeforces', external_id: '4A' }
    });
    expect(compCF.problemUrl).toBe('https://codeforces.com/problemset/problem/4A');

    const compCC = createComponent({
      problem: { id: 3, title: 'Number Mirror', difficulty: 'Easy', platform: 'CodeChef', external_id: 'START01' }
    });
    expect(compCC.problemUrl).toBe('https://www.codechef.com/problems/START01');
  });
});
