const ReplyRepository = require("../../Domains/replies/ReplyRepository");
const AddedReply = require("../../Domains/replies/entities/AddedReply");
const NotFoundError = require("../../Commons/exceptions/NotFoundError");
const AuthorizationError = require("../../Commons/exceptions/AuthorizationError");

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addReply(payload) {
    const { content, commentId, owner, is_delete = false, replyId = ""} = payload;
    const id = replyId ? replyId :  `reply-${this._idGenerator()}`;
    const date = new Date().toISOString();

    const query = {
      text: "INSERT INTO replies (id, comment_id, content, owner, date, is_delete) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, content, owner",
      values: [id, commentId, content, owner, date, is_delete],
    };

    const result = await this._pool.query(query);

    return new AddedReply({ ...result.rows[0] });
  }

  async verifyReplyExists(replyId) {
    const result = await this._pool.query(
      "SELECT id FROM replies WHERE id = $1",
      [replyId]
    );
    if (!result.rowCount) {
      throw new NotFoundError("Reply tidak ditemukan");
    }else {
      return true;
    }
  }

  async verifyReplyOwner(replyId, owner) {
    const result = await this._pool.query(
      "SELECT owner FROM replies WHERE id = $1",
      [replyId]
    );
    if (!result.rowCount) {
      throw new NotFoundError("Reply tidak ditemukan");
    }
    if (result.rows[0].owner !== owner) {
      throw new AuthorizationError("Anda tidak berhak mengakses resource ini");
    }

    return true;
  }

  async deleteReplyById(replyId) {
    await this._pool.query(
      "UPDATE replies SET is_delete = TRUE WHERE id = $1",
      [replyId]
    );
  }

  async getRepliesByCommentIds(commentIds) {
    const query = {
      text: `
        SELECT replies.id, replies.content, replies.date, replies.comment_id, replies.is_delete,
               users.username
        FROM replies
        JOIN users ON replies.owner = users.id
        WHERE replies.comment_id = ANY($1::text[])
        ORDER BY replies.date ASC
      `,
      values: [commentIds],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }
}

module.exports = ReplyRepositoryPostgres;
