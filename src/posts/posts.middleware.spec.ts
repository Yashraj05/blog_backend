import { PostsMiddleware } from './posts.middleware';

describe('PostsMiddleware', () => {
  it('should be defined', () => {
    expect(new PostsMiddleware()).toBeDefined();
  });
});
