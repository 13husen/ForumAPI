const GetThreadDetailUseCase = require("../GetThreadDetailUseCase");
const NotFoundError = require("../../../Commons/exceptions/NotFoundError");
const DetailComment = require("../../../Domains/comments/entities/DetailComment");

describe("GetThreadDetailUseCase", () => {
  let getThreadDetailUseCase;
  let threadRepository;

  let replyRepository;

  beforeEach(() => {
    threadRepository = {
      getThreadById: jest.fn(),
      getCommentsByThreadId: jest.fn(),
    };

    replyRepository = {
      getRepliesByCommentIds: jest.fn(),
    };

    getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository,
      replyRepository,
    });
  });

  describe("execute", () => {
    it("should return thread details with comments", async () => {
      // Arrange
      const threadId = "thread-123";
      const thread = {
        id: "thread-123",
        title: "Thread Title",
        body: "This is the thread body",
        date: "2025-04-21",
        username: "user-123",
      };
      const comments = [
        new DetailComment({
          id: "comment-123",
          username: "user-124",
          date: "2025-04-20",
          content: "This is a comment",
        }),
        new DetailComment({
          id: "comment-124",
          username: "user-125",
          date: "2025-04-19",
          content: "This is another comment",
        }),
      ];

      threadRepository.getThreadById.mockResolvedValue(thread);
      threadRepository.getCommentsByThreadId.mockResolvedValue(comments);
      replyRepository.getRepliesByCommentIds.mockResolvedValue([
        {
          id: "reply-001",
          comment_id: "comment-123",
          content: "This is a reply",
          date: "2025-04-21",
          username: "user-999",
        },
        {
          id: "reply-002",
          comment_id: "comment-124",
          content: "Another reply",
          date: "2025-04-21",
          username: "user-998",
        },
      ]);
      // Act
      const result = await getThreadDetailUseCase.execute(threadId);

      // Assert
      expect(threadRepository.getThreadById).toHaveBeenCalledWith(threadId);
      expect(threadRepository.getCommentsByThreadId).toHaveBeenCalledWith(
        threadId
      );
      expect(replyRepository.getRepliesByCommentIds).toBeCalledTimes(1)
      expect(result).toEqual({
        id: "thread-123",
        title: "Thread Title",
        body: "This is the thread body",
        date: "2025-04-21",
        username: "user-123",
        comments: [
          {
            id: "comment-123",
            username: "user-124",
            date: "2025-04-20",
            content: "This is a comment",
            replies: [
              {
                id: "reply-001",
                content: "This is a reply",
                date: "2025-04-21",
                username: "user-999",
              },
            ],
          },
          {
            id: "comment-124",
            username: "user-125",
            date: "2025-04-19",
            content: "This is another comment",
            replies: [
              {
                id: "reply-002",
                content: "Another reply",
                date: "2025-04-21",
                username: "user-998",
              },
            ],
          },
        ],
      });
    });

    it("should throw NotFoundError if thread does not exist", async () => {
      // Arrange
      const threadId = "thread-123";
      threadRepository.getThreadById.mockRejectedValue(
        new NotFoundError("Thread not found")
      );

      // Act & Assert
      await expect(
        getThreadDetailUseCase.execute(threadId)
      ).rejects.toThrowError(NotFoundError);
      expect(threadRepository.getThreadById).toHaveBeenCalledWith(threadId);
    });

    it("should throw NotFoundError if comments are not found", async () => {
      // Arrange
      const threadId = "thread-123";
      const thread = {
        id: "thread-123",
        title: "Thread Title",
        body: "This is the thread body",
        date: "2025-04-21",
        username: "user-123",
      };

      threadRepository.getThreadById.mockResolvedValue(thread);
      threadRepository.getCommentsByThreadId.mockResolvedValue([]);
      replyRepository.getRepliesByCommentIds.mockResolvedValue([
        {
          id: "reply-001",
          comment_id: "comment-123",
          content: "This is a reply",
          date: "2025-04-21",
          username: "user-999",
        },
        {
          id: "reply-002",
          comment_id: "comment-124",
          content: "Another reply",
          date: "2025-04-21",
          username: "user-998",
        },
      ]);

      // Act
      const result = await getThreadDetailUseCase.execute(threadId);

      // Assert
      expect(threadRepository.getThreadById).toHaveBeenCalledWith(threadId);
      expect(threadRepository.getCommentsByThreadId).toHaveBeenCalledWith(
        threadId
      );
      expect(replyRepository.getRepliesByCommentIds).toBeCalledTimes(1)
      expect(result.comments).toEqual([]);
    });

    it("should group multiple replies under the same comment and return empty array for comments without replies", async () => {
      // Arrange
      const threadId = "thread-456";
      const thread = {
        id: threadId,
        title: "Thread with multiple replies",
        body: "Thread body content",
        date: "2025-04-22",
        username: "user-111",
      };

      const comments = [
        new DetailComment({
          id: "comment-has-replies",
          username: "user-222",
          date: "2025-04-22",
          content: "Comment with replies",
        }),
        new DetailComment({
          id: "comment-no-replies",
          username: "user-333",
          date: "2025-04-22",
          content: "Comment without replies",
        }),
      ];

      const replies = [
        {
          id: "reply-1",
          comment_id: "comment-has-replies",
          content: "First reply",
          is_delete: false,
          date: "2025-04-22",
          username: "user-444",
        },
        {
          id: "reply-2",
          comment_id: "comment-has-replies",
          content: "Second reply",
          is_delete: false,
          date: "2025-04-22",
          username: "user-555",
        },
      ];

      threadRepository.getThreadById.mockResolvedValue(thread);
      threadRepository.getCommentsByThreadId.mockResolvedValue(comments);
      replyRepository.getRepliesByCommentIds.mockResolvedValue(replies);

      // Act
      const result = await getThreadDetailUseCase.execute(threadId);

      // Assert
      expect(threadRepository.getThreadById).toHaveBeenCalledWith(threadId);
      expect(threadRepository.getCommentsByThreadId).toHaveBeenCalledWith(
        threadId
      );
      expect(replyRepository.getRepliesByCommentIds).toBeCalledTimes(1)
      expect(result.comments).toHaveLength(2);

      // Comment with replies
      const commentWithReplies = result.comments.find(
        (c) => c.id === "comment-has-replies"
      );
      expect(commentWithReplies.replies).toHaveLength(2);
      expect(commentWithReplies.replies[0].content).toBe("First reply");
      expect(commentWithReplies.replies[1].content).toBe("Second reply");

      // Comment without replies
      const commentWithoutReplies = result.comments.find(
        (c) => c.id === "comment-no-replies"
      );
      expect(commentWithoutReplies.replies).toEqual([]);
    });

    it("should replace reply content with '**balasan telah dihapus**' if is_delete is true", async () => {
      // Arrange
      const threadId = "thread-999";
      const thread = {
        id: "thread-999",
        title: "Thread Deleted Content",
        body: "Thread body",
        date: "2025-04-22",
        username: "user-111",
      };

      const comments = [
        new DetailComment({
          id: "comment-999",
          username: "user-222",
          date: "2025-04-22",
          content: "Some comment",
        }),
      ];

      const replies = [
        {
          id: "reply-999",
          comment_id: "comment-999",
          content: "This will be hidden",
          is_delete: true,
          date: "2025-04-22",
          username: "user-333",
        },
      ];

      threadRepository.getThreadById.mockResolvedValue(thread);
      threadRepository.getCommentsByThreadId.mockResolvedValue(comments);
      replyRepository.getRepliesByCommentIds.mockResolvedValue(replies);

      // Act
      const result = await getThreadDetailUseCase.execute(threadId);

      // Assert
      expect(threadRepository.getThreadById).toHaveBeenCalledWith(threadId);
      expect(threadRepository.getCommentsByThreadId).toHaveBeenCalledWith(
        threadId
      );
      expect(replyRepository.getRepliesByCommentIds).toBeCalledTimes(1)
      expect(result.comments[0].replies[0].content).toEqual(
        "**balasan telah dihapus**"
      );
    });
  });
});
