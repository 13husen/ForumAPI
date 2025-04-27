const ToggleLikeComment = require('../ToggleLikeComment');

describe('ToggleLikeComment entity', () => {
  it('should throw error when payload not contain needed property', () => {
    expect(() => new ToggleLikeComment({})).toThrowError('TOGGLE_LIKE_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload not meet data type specification', () => {
    expect(() => new ToggleLikeComment({ threadId: 123, commentId: 'comment-123', userId: 'user-123' }))
      .toThrowError('TOGGLE_LIKE_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create ToggleLikeComment object correctly', () => {
    const payload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      userId: 'user-123',
    };

    const toggleLikeComment = new ToggleLikeComment(payload);

    expect(toggleLikeComment.threadId).toEqual(payload.threadId);
    expect(toggleLikeComment.commentId).toEqual(payload.commentId);
    expect(toggleLikeComment.userId).toEqual(payload.userId);
  });
});