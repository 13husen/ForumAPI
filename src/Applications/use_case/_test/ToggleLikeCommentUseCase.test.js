const ToggleLikeCommentUseCase = require('../ToggleLikeCommentUseCase');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

describe('ToggleLikeCommentUseCase', () => {
  let useCase;
  let threadRepository;
  let commentRepository;
  let commentLikeRepository;

  beforeEach(() => {
    threadRepository = {
      verifyThreadExists: jest.fn(),
    };

    commentRepository = {
      verifyCommentExists: jest.fn(),
    };

    commentLikeRepository = {
      hasUserLikedComment: jest.fn(),
      likeComment: jest.fn(),
      unlikeComment: jest.fn(),
    };

    useCase = new ToggleLikeCommentUseCase({
      threadRepository,
      commentRepository,
      commentLikeRepository,
    });
  });

  it('should orchestrate the toggle like when comment is already liked', async () => {
    const payload = { threadId: 'thread-123', commentId: 'comment-123', userId: 'user-123' };

    threadRepository.verifyThreadExists.mockResolvedValue();
    commentRepository.verifyCommentExists.mockResolvedValue();
    commentLikeRepository.hasUserLikedComment.mockResolvedValue(true);
    commentLikeRepository.unlikeComment.mockResolvedValue();

    await useCase.execute(payload);

    expect(threadRepository.verifyThreadExists).toHaveBeenCalledWith(payload.threadId);
    expect(commentRepository.verifyCommentExists).toHaveBeenCalledWith(payload.commentId);
    expect(commentLikeRepository.hasUserLikedComment).toHaveBeenCalledWith(payload.commentId, payload.userId);
    expect(commentLikeRepository.unlikeComment).toHaveBeenCalledWith(payload.commentId, payload.userId);
    expect(commentLikeRepository.likeComment).not.toHaveBeenCalled();
  });

  it('should orchestrate the toggle like when comment is not liked yet', async () => {
    const payload = { threadId: 'thread-123', commentId: 'comment-124', userId: 'user-123' };

    threadRepository.verifyThreadExists.mockResolvedValue();
    commentRepository.verifyCommentExists.mockResolvedValue();
    commentLikeRepository.hasUserLikedComment.mockResolvedValue(false);
    commentLikeRepository.likeComment.mockResolvedValue();

    await useCase.execute(payload);

    expect(threadRepository.verifyThreadExists).toHaveBeenCalledWith(payload.threadId);
    expect(commentRepository.verifyCommentExists).toHaveBeenCalledWith(payload.commentId);
    expect(commentLikeRepository.hasUserLikedComment).toHaveBeenCalledWith(payload.commentId, payload.userId);
    expect(commentLikeRepository.likeComment).toHaveBeenCalledWith(payload.commentId, payload.userId);
    expect(commentLikeRepository.unlikeComment).not.toHaveBeenCalled();
  });

  it('should throw NotFoundError if thread does not exist', async () => {
    const payload = { threadId: 'thread-123', commentId: 'comment-123', userId: 'user-123' };

    threadRepository.verifyThreadExists.mockRejectedValue(new NotFoundError('Thread not found'));

    await expect(useCase.execute(payload)).rejects.toThrow(NotFoundError);

    expect(threadRepository.verifyThreadExists).toHaveBeenCalledWith(payload.threadId);
    expect(commentRepository.verifyCommentExists).not.toHaveBeenCalled();
    expect(commentLikeRepository.hasUserLikedComment).not.toHaveBeenCalled();
    expect(commentLikeRepository.likeComment).not.toHaveBeenCalled();
    expect(commentLikeRepository.unlikeComment).not.toHaveBeenCalled();
  });

  it('should throw NotFoundError if comment does not exist', async () => {
    const payload = { threadId: 'thread-123', commentId: 'comment-123', userId: 'user-123' };

    threadRepository.verifyThreadExists.mockResolvedValue();
    commentRepository.verifyCommentExists.mockRejectedValue(new NotFoundError('Comment not found'));

    await expect(useCase.execute(payload)).rejects.toThrow(NotFoundError);

    expect(threadRepository.verifyThreadExists).toHaveBeenCalledWith(payload.threadId);
    expect(commentRepository.verifyCommentExists).toHaveBeenCalledWith(payload.commentId);
    expect(commentLikeRepository.hasUserLikedComment).not.toHaveBeenCalled();
    expect(commentLikeRepository.likeComment).not.toHaveBeenCalled();
    expect(commentLikeRepository.unlikeComment).not.toHaveBeenCalled();
  });
});
