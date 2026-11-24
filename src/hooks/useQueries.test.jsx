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
});
