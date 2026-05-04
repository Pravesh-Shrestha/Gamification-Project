export const API = {
  auth: {
    login: '/api/auth/login',
    me: '/api/auth/me',
    logout: '/api/auth/logout',
  },
  users: {
    list: '/api/users',
    profile: (id: string) => `/api/users/${id}`,
  },
  dashboard: {
    summary: '/api/dashboard/summary',
  },
  quests: {
    list: '/api/quests',
  },
};

export type Endpoints = typeof API;
