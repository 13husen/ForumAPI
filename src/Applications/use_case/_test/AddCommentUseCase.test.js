const AddCommentUseCase = require("../AddCommentUseCase");
const CreateComment = require("../../../Domains/comments/entities/CreateComment");
const NotFoundError = require("../../../Commons/exceptions/NotFoundError");

describe("AddCommentUseCase", () => {
  let addCommentUseCase;
  let commentRepository;
  let threadRepository;

  beforeEach(() => {
    commentRepository = {
      addComment: jest.fn(),
    };
    threadRepository = {
      verifyThreadExists: jest.fn(),
    };
    addCommentUseCase = new AddCommentUseCase({
      commentRepository,
      threadRepository,
    });
  });

  describe("execute", () => {
    it("should successfully add comment", async () => {
      // Arrange
      const threadId = "thread-123";
      const ownerId = "user-123";
      const payload = { content: "This is a new comment" };

      const expectedComment = {
        id: "comment-123",
        content: "This is a new comment",
        owner: "user-123",
      };

      threadRepository.verifyThreadExists.mockResolvedValue();

      commentRepository.addComment.mockResolvedValue(expectedComment);

      // Act
      const result = await addCommentUseCase.execute(
        payload,
        threadId,
        ownerId
      );

      // Assert
      expect(threadRepository.verifyThreadExists).toHaveBeenCalledWith(
        threadId
      );
      expect(commentRepository.addComment).toHaveBeenCalledWith(
        new CreateComment(payload),
        threadId,
        ownerId
      );
      expect(result).toStrictEqual(expectedComment);
    });

    it("should throw NotFoundError if thread does not exist", async () => {
      // Arrange
      const threadId = "thread-123";
      const ownerId = "user-123";
      const payload = { content: "This is a new comment" };

      threadRepository.verifyThreadExists.mockRejectedValue(
        new NotFoundError("Thread not found")
      );

      // Act & Assert
      await expect(
        addCommentUseCase.execute(payload, threadId, ownerId)
      ).rejects.toThrowError(NotFoundError);

      expect(threadRepository.verifyThreadExists).toHaveBeenCalledTimes(1);
      expect(threadRepository.verifyThreadExists).toHaveBeenCalledWith(
        threadId
      );
      expect(commentRepository.addComment).not.toHaveBeenCalled();
    });
  });
});
