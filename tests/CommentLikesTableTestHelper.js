const pool = require("../src/Infrastructures/database/postgres/pool");

const CommentLikesTableTestHelper = {
  async addLike({ id = "like-123", commentId, userId }) {
    const query = {
      text: "INSERT INTO comment_likes (id, comment_id, user_id) VALUES ($1, $2, $3)",
      values: [id, commentId, userId],
    };
    await pool.query(query);
  },

  async cleanTable() {
    await pool.query("DELETE FROM comment_likes");
  },
};

module.exports = CommentLikesTableTestHelper;
