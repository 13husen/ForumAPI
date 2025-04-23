/* istanbul ignore file */
const pool = require("../src/Infrastructures/database/postgres/pool");

const CommentTableTestHelper = {
  async addComment({
    id = "comment-123",
    content = "Ini komentar",
    threadId = "thread-123",
    ownerId = "user-123",
    isDelete = false,
  }) {
    const query = {
      text: "INSERT INTO comments(id, content, thread_id, owner, is_delete) VALUES($1, $2, $3, $4, $5)",
      values: [id, content, threadId, ownerId, isDelete],
    };

    await pool.query(query);

    return { comment_id: id }; 
  },

  async findCommentById(id) {
    const query = {
      text: "SELECT * FROM comments WHERE id = $1",
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query("DELETE FROM comments WHERE 1=1");
  },
};

module.exports = CommentTableTestHelper;
