/* istanbul ignore file */
const pool = require("../src/Infrastructures/database/postgres/pool");

const RepliesTableTestHelper = {
  async addReply({
    id = "reply-1234",
    commentId = "comment-123",
    content = "This is a reply",
    owner = "user-123",
    date = new Date().toISOString(),
    isDelete = false,
  }) {
    const query = {
      text: `
        INSERT INTO replies (id, comment_id, content, owner, date, is_delete)
        VALUES ($1, $2, $3, $4, $5, $6)
      `,
      values: [id, commentId, content, owner, date, isDelete],
    };
    await pool.query(query);
    return { reply_id: id };
  },

  async addDefaultReply() {
    return this.addReply({
      id: "reply-1234",
      commentId: "comment-123",
      content: "Default reply content",
      owner: "user-123",
    });
  },

  async findReplyById(id) {
    const query = {
      text: "SELECT * FROM replies WHERE id = $1",
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async expectReplyToBeDeleted(id) {
    const result = await pool.query(
      "SELECT is_delete FROM replies WHERE id = $1",
      [id]
    );
    if (!result.rows.length) throw new Error("Reply not found");
    expect(result.rows[0].is_delete).toBe(true);
  },

  async cleanTable() {
    await pool.query("DELETE FROM replies");
  },
};

module.exports = RepliesTableTestHelper;
