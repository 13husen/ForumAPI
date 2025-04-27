const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const pool = require('../../database/postgres/pool');
const CommentLikeRepositoryPostgres = require('../CommentLikeRepositoryPostgres');

describe('CommentLikeRepositoryPostgres', () => {
  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('likeComment function', () => {
    it('should persist like comment correctly', async () => {
      // Arrange
      const commentLikeRepository = new CommentLikeRepositoryPostgres(pool);
      
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', thread_id: 'thread-123', owner: 'user-123' });
      
      // Act
      await commentLikeRepository.likeComment('comment-123', 'user-123');

      // Assert
      const result = await pool.query('SELECT * FROM comment_likes WHERE comment_id = $1 AND user_id = $2', ['comment-123', 'user-123']);
      expect(result.rowCount).toEqual(1);
      expect(result.rows[0].comment_id).toEqual('comment-123');
      expect(result.rows[0].user_id).toEqual('user-123');
    });
  });

  describe('hasUserLikedComment function', () => {
    it('should return true when user has liked the comment', async () => {
      // Arrange
      const commentLikeRepository = new CommentLikeRepositoryPostgres(pool);

      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', thread_id: 'thread-123', owner: 'user-123' });

      await commentLikeRepository.likeComment('comment-123', 'user-123');

      // Act
      const hasLiked = await commentLikeRepository.hasUserLikedComment('comment-123', 'user-123');

      // Assert
      expect(hasLiked).toBe(true);
    });

    it('should return false when user has not liked the comment', async () => {
      // Arrange
      const commentLikeRepository = new CommentLikeRepositoryPostgres(pool);

      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', thread_id: 'thread-123', owner: 'user-123' });

      // Act
      const hasLiked = await commentLikeRepository.hasUserLikedComment('comment-123', 'user-123');

      // Assert
      expect(hasLiked).toBe(false);
    });
  });

  describe('unlikeComment function', () => {
    it('should remove like from comment', async () => {
      // Arrange
      const commentLikeRepository = new CommentLikeRepositoryPostgres(pool);

      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', thread_id: 'thread-123', owner: 'user-123' });

      await commentLikeRepository.likeComment('comment-123', 'user-123');

      // Act
      await commentLikeRepository.unlikeComment('comment-123', 'user-123');

      // Assert
      const result = await pool.query('SELECT * FROM comment_likes WHERE comment_id = $1 AND user_id = $2', ['comment-123', 'user-123']);
      expect(result.rowCount).toEqual(0);
    });
  });
});
