const AddReplyUseCase = require("../AddReplyUseCase");
const AddReply = require("../../../Domains/replies/entities/AddReply");
const AddedReply = require("../../../Domains/replies/entities/AddedReply");

describe("AddReplyUseCase", () => {
  it("should orchestrate the add reply action correctly", async () => {
    // Arrange
    const useCasePayload = {
      content: "sebuah balasan",
      threadId: "thread-123",
      commentId: "comment-123",
      owner: "user-123",
    };

    const fakeAddedReply = new AddedReply({
      id: "reply-123",
      content: "sebuah balasan",
      owner: "user-123",
    });

    const expectedAddedReply = new AddedReply({
      id: 'reply-123',
      content: 'sebuah balasan',
      owner: 'user-123',
    });

    const mockThreadRepository = {
      verifyThreadExists: jest.fn(() => Promise.resolve()),
    };
    const mockCommentRepository = {
      verifyCommentExists: jest.fn(() => Promise.resolve()),
    };
    const mockReplyRepository = {
      addReply: jest.fn(() => Promise.resolve(fakeAddedReply)),
    };

    const addReplyUseCase = new AddReplyUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Act
    const addedReply = await addReplyUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.verifyThreadExists).toBeCalledWith(
      useCasePayload.threadId
    );
    expect(mockCommentRepository.verifyCommentExists).toBeCalledWith(
      useCasePayload.commentId
    );
    expect(mockReplyRepository.addReply).toBeCalledWith(
      new AddReply(useCasePayload)
    );
    expect(addedReply).toStrictEqual(expectedAddedReply);
  });

  it("should throw error if thread does not exist", async () => {
    // Arrange
    const useCasePayload = {
      content: "sebuah balasan",
      threadId: "thread-not-found",
      commentId: "comment-123",
      owner: "user-123",
    };

    const mockThreadRepository = {
      verifyThreadExists: jest.fn(() =>
        Promise.reject(new Error("Thread not found"))
      ),
    };
    const mockCommentRepository = {
      verifyCommentExists: jest.fn(),
    };
    const mockReplyRepository = {
      addReply: jest.fn(),
    };

    const addReplyUseCase = new AddReplyUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Act & Assert
    await expect(addReplyUseCase.execute(useCasePayload)).rejects.toThrowError(
      "Thread not found"
    );
    expect(mockThreadRepository.verifyThreadExists).toBeCalledWith(
      "thread-not-found"
    );
    expect(mockCommentRepository.verifyCommentExists).not.toBeCalled();
    expect(mockReplyRepository.addReply).not.toBeCalled();
  });

  it("should throw error if comment does not exist", async () => {
    // Arrange
    const useCasePayload = {
      content: "sebuah balasan",
      threadId: "thread-123",
      commentId: "comment-not-found",
      owner: "user-123",
    };

    const mockThreadRepository = {
      verifyThreadExists: jest.fn(() => Promise.resolve()),
    };
    const mockCommentRepository = {
      verifyCommentExists: jest.fn(() =>
        Promise.reject(new Error("Comment not found"))
      ),
    };
    const mockReplyRepository = {
      addReply: jest.fn(),
    };

    const addReplyUseCase = new AddReplyUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Act & Assert
    await expect(addReplyUseCase.execute(useCasePayload)).rejects.toThrowError(
      "Comment not found"
    );
    expect(mockThreadRepository.verifyThreadExists).toBeCalledWith(
      "thread-123"
    );
    expect(mockCommentRepository.verifyCommentExists).toBeCalledWith(
      "comment-not-found"
    );
    expect(mockReplyRepository.addReply).not.toBeCalled();
  });
});
