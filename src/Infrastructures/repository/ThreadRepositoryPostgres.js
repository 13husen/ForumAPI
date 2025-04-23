const NotFoundError = require("../../Commons/exceptions/NotFoundError");
const CreatedThread = require("../../Domains/threads/entities/CreatedThread");
const DetailComment = require("../../Domains/comments/entities/DetailComment");
const ThreadRepository = require("../../Domains/threads/ThreadRepository");

class ThreadRepositoryPostgres extends ThreadRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addThread(createThread, user) {
    const { title, body } = createThread;
    const id = `thread-${this._idGenerator()}`;
    const query = {
      text: "INSERT INTO threads(id, title, body, owner) VALUES($1,$2,$3,$4) RETURNING id, title, body, owner",
      values: [id, title, body, user?.id],
    };
    const result = await this._pool.query(query);
    return new CreatedThread({ ...result.rows[0] });
  }

  async verifyThreadExists(threadId) {
    const result = await this._pool.query({
      text: "SELECT id FROM threads WHERE id = $1",
      values: [threadId],
    });

    if (!result.rowCount) {
      throw new NotFoundError("threads tidak ditemukan di database");
    }
  }

  async getThreadById(threadId) {
    const query = {
      text: `
        SELECT t.id, t.title, t.body, t.date, u.username
        FROM threads t
        LEFT JOIN users u ON t.owner = u.id
        WHERE t.id = $1
      `,
      values: [threadId],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError("Thread tidak ditemukan");
    }
    return result.rows[0];
  }

  async getCommentsByThreadId(threadId) {
    const query = {
      text: `
        SELECT c.id, c.content, c.created_at as date, c.is_delete, u.username
        FROM comments c
        LEFT JOIN users u ON c.owner = u.id
        WHERE c.thread_id = $1
        ORDER BY c.created_at ASC
      `,
      values: [threadId],
    };

    const result = await this._pool.query(query);
    return result.rows.map(
      (comment) =>
        new DetailComment({
          id: comment.id,
          username: comment.username,
          date: comment.date,
          content: comment.content,
          is_delete: comment.is_delete,
        })
    );
  }
}

module.exports = ThreadRepositoryPostgres;
