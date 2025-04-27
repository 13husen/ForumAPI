const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const pool = require("../../database/postgres/pool");
const ThreadRepositoryPostgres = require("../ThreadRepositoryPostgres");
const CreateThread = require("../../../Domains/threads/entities/CreateThread");
const NotFoundError = require("../../../Commons/exceptions/NotFoundError");
const CommentTableTestHelper = require("../../../../tests/CommentsTableTestHelper");
const DetailComment = require("../../../Domains/comments/entities/DetailComment");

describe("ThreadRepositoryPostgres", () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe("addThread function", () => {
    it("should persist new thread and return created thread correctly", async () => {
      // Arrange
      const fakeIdGenerator = () => "123";
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      const user = { id: "user-123", username: "johndoe" };
      await UsersTableTestHelper.addUser(user);

      const createThread = new CreateThread({
        title: "Sebuah thread",
        body: "Isi thread",
        owner: user.id,
      });

      // Act
      const createdThread = await threadRepositoryPostgres.addThread(
        createThread,
        user
      );

      // Assert
      expect(createdThread.id).toEqual("thread-123");
      expect(createdThread.title).toEqual(createThread.title);
      expect(createdThread.body).toEqual(createThread.body);
      expect(createdThread.owner).toEqual(user.id);

      // Asser
      const threads = await ThreadsTableTestHelper.findThreadById("thread-123");
      expect(threads).toHaveLength(1);
      expect(threads[0].id).toEqual("thread-123");
      expect(threads[0].title).toEqual(createThread.title);
      expect(threads[0].body).toEqual(createThread.body);
      expect(threads[0].owner).toEqual(user.id);
    });
  });

  describe("verifyThreadExists function", () => {
    it("should throw NotFoundError when thread not found", async () => {
      const threadRepository = new ThreadRepositoryPostgres(pool, () => "123");
      await expect(
        threadRepository.verifyThreadExists("thread-not-exist")
      ).rejects.toThrow(NotFoundError);
    });

    it("should not throw NotFoundError when thread exists", async () => {
      await UsersTableTestHelper.addUser({ id: "user-123" });
      await ThreadsTableTestHelper.addThread({
        id: "thread-123",
        owner: "user-123",
      });

      const threadRepository = new ThreadRepositoryPostgres(pool, () => "123");

      await expect(
        threadRepository.verifyThreadExists("thread-123")
      ).resolves.not.toThrow(NotFoundError);
    });
  });

  describe("getThreadById function", () => {
    it("should return thread data correctly", async () => {
      await UsersTableTestHelper.addUser({
        id: "user-123",
        username: "dicoding",
      });
      await ThreadsTableTestHelper.addThread({
        id: "thread-123",
        title: "thread title",
        body: "thread body",
        owner: "user-123",
      });
  
      const threadRepository = new ThreadRepositoryPostgres(pool, () => "123");
      const thread = await threadRepository.getThreadById("thread-123");
  
      expect(thread.id).toEqual("thread-123");
      expect(thread.title).toEqual("thread title");
      expect(thread.body).toEqual("thread body");
      expect(thread.username).toEqual("dicoding");
      expect(thread.date).toBeDefined();
    });
  
    it("should throw NotFoundError when thread not found", async () => {
      const threadRepository = new ThreadRepositoryPostgres(pool, () => "123");
      await expect(
        threadRepository.getThreadById("thread-not-found")
      ).rejects.toThrowError(new NotFoundError("threads tidak ditemukan di database"));
    });
  });
  

  describe("getCommentsByThreadId function", () => {
    it("should return comments sorted by created_at and format content properly", async () => {
      await UsersTableTestHelper.addUser({
        id: "user-123",
        username: "dicoding",
      });
      await ThreadsTableTestHelper.addThread({
        id: "thread-123",
        owner: "user-123",
      });

      const comment1 = {
        id: "comment-123",
        thread_id: "thread-123",
        content: "komentar pertama",
        owner: "user-123",
        created_at: new Date("2023-01-01T00:00:00Z"),
        isDelete: false,
      };
      const comment2 = {
        id: "comment-124",
        thread_id: "thread-123",
        content: "rahasia",
        owner: "user-123",
        created_at: new Date("2023-01-02T00:00:00Z"),
        isDelete: true,
      };

      await CommentTableTestHelper.addComment(comment1);
      await CommentTableTestHelper.addComment(comment2);

      const threadRepository = new ThreadRepositoryPostgres(pool, () => "123");
      const comments = await threadRepository.getCommentsByThreadId("thread-123");

      expect(comments).toHaveLength(2);
      // Assert 
      expect(comments[0]).toBeInstanceOf(DetailComment);
      expect(comments[0].id).toBe("comment-123");
      expect(comments[0].content).toBe("komentar pertama");
      expect(comments[0].username).toBe("dicoding");
      expect(comments[0].date).toBeDefined();
      
      expect(comments[1]).toBeInstanceOf(DetailComment);
      expect(comments[1].id).toBe("comment-124");
      expect(comments[1].content).toBe("**komentar telah dihapus**");
      expect(comments[1].username).toBe("dicoding");
      expect(comments[1].date).toBeDefined();

    });
  });
});
