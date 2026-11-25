import { describe, it, expect } from 'vitest';
import { queryKeys } from './useQueries';

describe('queryKeys factory', () => {
  it('normalizes username to lowercase in user query key', () => {
    expect(queryKeys.user('MomanAmjad')).toEqual(['user', 'momanamjad']);
  });

  it('normalizes owner and repo in repo query key', () => {
    expect(queryKeys.repo('MomanAmjad', 'MyRepo')).toEqual(['repo', 'momanamjad', 'myrepo']);
  });

  it('handles empty path in repoContents query key', () => {
    expect(queryKeys.repoContents('user', 'repo', '')).toEqual(['repoContents', 'user', 'repo', '']);
  });

  it('creates activityFeed query key with defaults and custom pagination', () => {
    expect(queryKeys.activityFeed()).toEqual(['activityFeed', 1, 20]);
    expect(queryKeys.activityFeed(2, 10)).toEqual(['activityFeed', 2, 10]);
  });
});
