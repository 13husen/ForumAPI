const CommentLikeRepository = require("../../Domains/comment-likes/CommentLikeRepository");

class CommentLikeRepositoryPostgres extends CommentLikeRepository {
  constructor(pool) {
    super();
    this._pool = pool;
  }

  async hasUserLikedComment(commentId, userId) {
    const query = {
      text: "SELECT 1 FROM comment_likes WHERE comment_id = $1 AND user_id = $2",
      values: [commentId, userId],
    };

    const result = await this._pool.query(query);

    return result.rowCount > 0;
  }

  async likeComment(commentId, userId) {
    const id = `like-${Math.random().toString(36).substr(2, 16)}`;
    const query = {
      text: "INSERT INTO comment_likes (id, comment_id, user_id) VALUES ($1, $2, $3)",
      values: [id, commentId, userId],
    };

    await this._pool.query(query);
  }

  async unlikeComment(commentId, userId) {
    const query = {
      text: "DELETE FROM comment_likes WHERE comment_id = $1 AND user_id = $2",
      values: [commentId, userId],
    };

    await this._pool.query(query);
  }
}

module.exports = CommentLikeRepositoryPostgres;
