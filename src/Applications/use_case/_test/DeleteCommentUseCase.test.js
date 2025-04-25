const DeleteCommentUseCase = require('../DeleteCommentUseCase');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

describe('DeleteCommentUseCase', () => {
  let useCase;
  let commentRepository;
  let threadRepository;

  beforeEach(() => {
    commentRepository = {
      verifyCommentExists: jest.fn(),
      verifyCommentOwner: jest.fn(),
      deleteCommentById: jest.fn(),
    };

    threadRepository = {
      verifyThreadExists: jest.fn(),
    };

    useCase = new DeleteCommentUseCase({
      commentRepository,
      threadRepository,
    });
  });

  it('should orchestrate the delete comment use case correctly', async () => {
    const payload = { threadId: 'thread-123', commentId: 'comment-123', owner: 'user-123' };

    threadRepository.verifyThreadExists.mockResolvedValue();
    commentRepository.verifyCommentExists.mockResolvedValue(true);
    commentRepository.verifyCommentOwner.mockResolvedValue(true);
    commentRepository.deleteCommentById.mockResolvedValue();

    await useCase.execute(payload);

    expect(threadRepository.verifyThreadExists).toHaveBeenCalledWith(payload.threadId);
    expect(commentRepository.verifyCommentExists).toHaveBeenCalledWith(payload.commentId);
    expect(commentRepository.verifyCommentOwner).toHaveBeenCalledWith(payload.commentId, payload.owner);
    expect(commentRepository.deleteCommentById).toHaveBeenCalledWith(payload.commentId);
  });

  it('should throw NotFoundError if thread does not exist', async () => {
    const payload = { threadId: 'thread-123', commentId: 'comment-123', owner: 'user-123' };

    threadRepository.verifyThreadExists.mockRejectedValue(new NotFoundError('Thread not found'));

    await expect(useCase.execute(payload)).rejects.toThrow(NotFoundError);

    expect(threadRepository.verifyThreadExists).toHaveBeenCalledWith(payload.threadId);
    expect(commentRepository.verifyCommentExists).not.toHaveBeenCalled();
    expect(commentRepository.verifyCommentOwner).not.toHaveBeenCalled();
    expect(commentRepository.deleteCommentById).not.toHaveBeenCalled();
  });

  it('should throw NotFoundError if comment does not exist', async () => {
    const payload = { threadId: 'thread-123', commentId: 'comment-123', owner: 'user-123' };

    threadRepository.verifyThreadExists.mockResolvedValue();
    commentRepository.verifyCommentExists.mockRejectedValue(new NotFoundError('Comment not found'));

    await expect(useCase.execute(payload)).rejects.toThrow(NotFoundError);

    expect(threadRepository.verifyThreadExists).toHaveBeenCalledWith(payload.threadId);
    expect(commentRepository.verifyCommentExists).toHaveBeenCalledWith(payload.commentId);
    expect(commentRepository.verifyCommentOwner).not.toHaveBeenCalled();
    expect(commentRepository.deleteCommentById).not.toHaveBeenCalled();
  });

  it('should throw AuthorizationError if user is not the comment owner', async () => {
    const payload = { threadId: 'thread-123', commentId: 'comment-123', owner: 'user-123' };

    threadRepository.verifyThreadExists.mockResolvedValue();
    commentRepository.verifyCommentExists.mockResolvedValue(true);
    commentRepository.verifyCommentOwner.mockRejectedValue(new AuthorizationError('Not the owner'));

    await expect(useCase.execute(payload)).rejects.toThrow(AuthorizationError);

    expect(threadRepository.verifyThreadExists).toHaveBeenCalledWith(payload.threadId);
    expect(commentRepository.verifyCommentExists).toHaveBeenCalledWith(payload.commentId);
    expect(commentRepository.verifyCommentOwner).toHaveBeenCalledWith(payload.commentId, payload.owner);
    expect(commentRepository.deleteCommentById).not.toHaveBeenCalled();
  });
});
