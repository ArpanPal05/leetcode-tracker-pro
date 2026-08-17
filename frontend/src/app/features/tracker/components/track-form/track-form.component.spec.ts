import '@angular/compiler';
import { FormControl } from '@angular/forms';
import { describe, expect, it } from 'vitest';
import { problemUrlValidator } from './track-form.component';

describe('problemUrlValidator', () => {
  it('should return null for empty input so required validator handles it', () => {
    expect(problemUrlValidator(new FormControl(''))).toBeNull();
    expect(problemUrlValidator(new FormControl(null))).toBeNull();
    expect(problemUrlValidator(new FormControl('   '))).toBeNull();
  });

  describe('LeetCode URLs', () => {
    it('should accept valid LeetCode URLs', () => {
      const validUrls = [
        'https://leetcode.com/problems/two-sum/',
        'https://leetcode.com/problems/two-sum',
        'https://www.leetcode.com/problems/3sum/',
        'http://leetcode.com/problems/median-of-two-sorted-arrays/description/',
        'https://leetcode.com/problems/valid-parentheses'
      ];
      validUrls.forEach((url) => {
        expect(problemUrlValidator(new FormControl(url))).toBeNull();
      });
    });
  });

  describe('Codeforces URLs', () => {
    it('should accept valid Codeforces URLs', () => {
      const validUrls = [
        'https://codeforces.com/problemset/problem/4/A',
        'https://codeforces.com/problemset/problem/4/A/',
        'https://www.codeforces.com/contest/1800/problem/D',
        'http://codeforces.com/contest/1800/problem/D/'
      ];
      validUrls.forEach((url) => {
        expect(problemUrlValidator(new FormControl(url))).toBeNull();
      });
    });
  });

  describe('CodeChef URLs', () => {
    it('should accept valid CodeChef URLs', () => {
      const validUrls = [
        'https://www.codechef.com/problems/START01',
        'https://www.codechef.com/problems/START01/',
        'https://codechef.com/problems/FLOW001',
        'https://codechef.com/problems/FLOW001/',
        'http://www.codechef.com/problems/COCONUT/description',
        'https://codechef.com/problems/CHEFPRMS'
      ];
      validUrls.forEach((url) => {
        expect(problemUrlValidator(new FormControl(url))).toBeNull();
      });
    });
  });

  describe('Invalid URLs', () => {
    it('should reject unsupported domains and invalid URL structures', () => {
      const invalidUrls = [
        'https://google.com',
        'https://github.com/angular/angular',
        'https://hackerrank.com/challenges/simple-array-sum',
        'https://geeksforgeeks.org/problems/two-sum',
        'https://www.codechef.com/',
        'https://www.codechef.com/contests/START100',
        'https://codechef.com/practice',
        'not a url'
      ];
      invalidUrls.forEach((url) => {
        expect(problemUrlValidator(new FormControl(url))).toEqual({ invalidProblemUrl: true });
      });
    });
  });
});
