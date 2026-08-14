export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ME: '/auth/me'
  },
  DASHBOARD: {
    SUMMARY: '/dashboard/summary',
    DISTRIBUTIONS: '/dashboard/distributions',
    ACTIVITY: '/dashboard/activity',
    STREAK: '/dashboard/streak',
    HEATMAP: '/dashboard/heatmap'
  },
  PROBLEMS: {
    BASE: '/problems'
  },
  USER_PROBLEMS: {
    BASE: '/user-problems',
    TRACK: '/user-problems/track'
  },
  PROBLEM_IMPORT: {
    LEETCODE: '/import/leetcode'
  }
} as const;
