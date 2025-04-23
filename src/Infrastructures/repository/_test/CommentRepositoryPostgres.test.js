const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const pool = require('../../../Infrastructures/database/postgres/pool');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

describe('CommentRepositoryPostgres integration test', () => {
  const idGenerator = () => '123'; 
  const repository = new CommentRepositoryPostgres(pool, idGenerator);

  beforeAll(async () => {
    await pool.query("INSERT INTO users(id, username, fullname, password) VALUES ('user-123', 'dicoding', 'dicoding test','dummy_pass') ON CONFLICT DO NOTHING");
    await pool.query("INSERT INTO threads(id, title, body, owner) VALUES ('thread-123', 'Thread title', 'Thread body', 'user-123') ON CONFLICT DO NOTHING");
  });

  afterEach(async () => {
    await pool.query("DELETE FROM comments WHERE id = 'comment-123'");
  });

  afterAll(async () => {
    await pool.query("DELETE FROM comments");
    await pool.query("DELETE FROM threads");
    await pool.query("DELETE FROM users");
    await pool.end();
  });

  describe('addComment', () => {
    it('should persist and return added comment', async () => {
      const comment = { content: 'sebuah komentar' };

      const result = await repository.addComment(comment, 'thread-123', 'user-123');

      expect(result).toEqual({
        id: 'comment-123',
        content: 'sebuah komentar',
        owner: 'user-123',
      });

      const check = await pool.query("SELECT * FROM comments WHERE id = 'comment-123'");
      expect(check.rowCount).toBe(1);
    });
  });

  describe('verifyCommentExists', () => {
    it('should throw NotFoundError if comment not exist', async () => {
      await expect(repository.verifyCommentExists('not-found')).rejects.toThrow(NotFoundError);
    });
    it('should not throw error if comment exists', async () => {
      await repository.addComment({ content: 'abc' }, 'thread-123', 'user-123');
      await expect(repository.verifyCommentExists('comment-123')).resolves.toBeUndefined();
    });
  });

  describe('verifyCommentOwner', () => {
    it('should throw AuthorizationError if owner mismatch', async () => {
      await repository.addComment({ content: 'abc' }, 'thread-123', 'user-123');

      await expect(repository.verifyCommentOwner('comment-123', 'user-456')).rejects.toThrow(AuthorizationError);
    });

    it('should not throw if owner matched', async () => {
      await repository.addComment({ content: 'abc' }, 'thread-123', 'user-123');

      await expect(repository.verifyCommentOwner('comment-123', 'user-123')).resolves.not.toThrow();
    });
  });

  describe('deleteCommentById', () => {
    it('should soft delete the comment', async () => {
      await repository.addComment({ content: 'abc' }, 'thread-123', 'user-123');

      await repository.deleteCommentById('comment-123');

      const result = await pool.query("SELECT is_delete FROM comments WHERE id = 'comment-123'");
      expect(result.rows[0].is_delete).toBe(true);
    });
  });
});
