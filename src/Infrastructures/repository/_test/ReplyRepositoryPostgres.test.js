const pool = require("../../database/postgres/pool");
const AddedReply = require("../../../Domains/replies/entities/AddedReply");
const NotFoundError = require("../../../Commons/exceptions/NotFoundError");
const AuthorizationError = require("../../../Commons/exceptions/AuthorizationError");
const ReplyRepositoryPostgres = require("../ReplyRepositoryPostgres");
const RepliesTableTestHelper = require("../../../../tests/RepliesTableTestHelper");
const CommentTableTestHelper = require("../../../../tests/CommentsTableTestHelper");
const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");

describe("ReplyRepositoryPostgres", () => {
  let replyRepository;

  const fakeIdGenerator = jest.fn().mockReturnValue("123");

  beforeEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    replyRepository = new ReplyRepositoryPostgres(pool, fakeIdGenerator);
  });

  beforeAll(async () => {
    replyRepository = new ReplyRepositoryPostgres(pool);
    await pool.query(
      "INSERT INTO users (id, username, password, fullname) VALUES ('user-123', 'dicoding','dummy_pass','Data dicoding') ON CONFLICT DO NOTHING"
    );
    await pool.query(
      "INSERT INTO threads(id, title, body, owner) VALUES ('thread-123', 'Thread title', 'Thread body', 'user-123') ON CONFLICT DO NOTHING"
    );
    await pool.query(
      "INSERT INTO comments (id, thread_id, content, owner) VALUES ('comment-123','thread-123', 'This is a comment', 'user-123') ON CONFLICT DO NOTHING"
    );
  });

  afterAll(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  describe("addReply", () => {
    it("should add a reply correctly", async () => {
      const payload = {
        content: "This is a reply",
        commentId: "comment-123",
        owner: "user-123",
      };

      const addedReply = await replyRepository.addReply(payload);

      expect(fakeIdGenerator).toHaveBeenCalled();
      expect(addedReply.id).toBe("reply-123");
      expect(addedReply.content).toBe("This is a reply");
      expect(addedReply.owner).toBe("user-123");

      const replyInDb = await RepliesTableTestHelper.findReplyById("reply-123");
      expect(replyInDb).toHaveLength(1);
      expect(replyInDb[0].id).toBe("reply-123");
      expect(replyInDb[0].content).toBe("This is a reply");
      expect(replyInDb[0].comment_id).toBe("comment-123");
      expect(replyInDb[0].owner).toBe("user-123");
      expect(replyInDb[0].is_delete).toBe(false);
    });
  });

  describe("verifyReplyExists", () => {
    it("should throw NotFoundError if reply does not exist", async () => {
      await expect(
        replyRepository.verifyReplyExists("reply-not-exist")
      ).rejects.toThrowError(new NotFoundError("Reply tidak ditemukan"));
    });

    it("should not throw error if reply exists", async () => {
      const payload = {
        content: "This is a reply",
        commentId: "comment-123",
        owner: "user-123",
      };
      await replyRepository.addReply(payload);

      await expect(
        replyRepository.verifyReplyExists("reply-123")
      ).resolves.not.toThrowError();
    });
  });

  describe("verifyReplyOwner", () => {
    it("should throw AuthorizationError if the owner does not match", async () => {
      const payload = {
        content: "This is a reply",
        commentId: "comment-123",
        owner: "user-123",
      };
      await replyRepository.addReply(payload);

      await expect(
        replyRepository.verifyReplyOwner("reply-123", "user-456")
      ).rejects.toThrowError(
        new AuthorizationError("Anda tidak berhak mengakses resource ini")
      );
    });

    it("should not throw error if the owner matches", async () => {
      const payload = {
        content: "This is a reply",
        commentId: "comment-123",
        owner: "user-123",
      };
      await replyRepository.addReply(payload);

      await expect(
        replyRepository.verifyReplyOwner("reply-123", "user-123")
      ).resolves.not.toThrowError();
    });

    it("should throw NotFoundError if reply does not exist", async () => {
      await expect(
        replyRepository.verifyReplyOwner("reply-not-found", "user-123")
      ).rejects.toThrowError(new NotFoundError("Reply tidak ditemukan"));
    });
  });

  describe("deleteReplyById", () => {
    it("should soft delete the reply", async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        id: "userdelete-123",
        username: "dicodingdelete",
      });
      await ThreadsTableTestHelper.addThread({
        id: "threaddelete-123",
        owner: "userdelete-123",
      });
      await CommentTableTestHelper.addComment({
        id: "commentdelete-123",
        thread_id: "threaddelete-123",
        owner: "userdelete-123",
      });
      await RepliesTableTestHelper.addReply({
        id: "replydelete-123",
        comment_id: "commentdelete-123",
        content: "ini balasan",
        owner: "userdelete-123",
        date: new Date().toISOString(),
      });

      const replyRepository = new ReplyRepositoryPostgres(pool, () => "123");

      // Act
      await replyRepository.deleteReplyById("replydelete-123");

      // Assert
      const reply = await RepliesTableTestHelper.findReplyById(
        "replydelete-123"
      );
      expect(reply[0].is_delete).toBe(true);
    });
  });

  describe("getRepliesByCommentIds", () => {
    RepliesTableTestHelper.cleanTable();
    it("should return replies based on comment ids", async () => {
      const replyRepository = new ReplyRepositoryPostgres(pool, () => "123");

      // Arrange
      await UsersTableTestHelper.addUser({
        id: "userreplies-123",
        username: "dicodingreplies",
      });
      await ThreadsTableTestHelper.addThread({
        id: "threadreplies-123",
        owner: "userreplies-123",
      });
      await CommentTableTestHelper.addComment({
        id: "commentreplies-123",
        thread_id: "threadreplies-123",
        owner: "userreplies-123",
      });

      const payload = {
        replyId: "reply-111",
        content: "Balasan satu",
        commentId: "commentreplies-123",
        owner: "userreplies-123",
      };
      const payload2 = {
        replyId: "reply-112",
        content: "Balasan dua",
        commentId: "commentreplies-123",
        owner: "userreplies-123",
        is_delete: true,
      };

      await replyRepository.addReply(payload);
      await replyRepository.addReply(payload2);

      // Act
      const replies = await replyRepository.getRepliesByCommentIds([
        "commentreplies-123",
      ]);

      // Assert
      expect(replies).toHaveLength(2);
      const sortedReplies = [...replies].sort((a, b) => a.id.localeCompare(b.id));

      expect(sortedReplies[0]).toEqual(expect.objectContaining({
        content: "Balasan satu",
        comment_id: "commentreplies-123",
        username: "dicodingreplies",
        is_delete: false,
      }));
      expect(sortedReplies[1]).toEqual(expect.objectContaining({
        content: "Balasan dua",
        is_delete: true,
      }));
    });
    
  });
});
