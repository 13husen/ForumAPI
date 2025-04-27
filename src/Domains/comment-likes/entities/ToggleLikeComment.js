class ToggleLikeComment {
    constructor(payload) {
      this._verifyPayload(payload);
  
      const { threadId, commentId, userId } = payload;
  
      this.threadId = threadId;
      this.commentId = commentId;
      this.userId = userId;
    }
  
    _verifyPayload({ threadId, commentId, userId }) {
      if (!threadId || !commentId || !userId) {
        throw new Error('TOGGLE_LIKE_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
      }
  
      if (
        typeof threadId !== 'string' ||
        typeof commentId !== 'string' ||
        typeof userId !== 'string'
      ) {
        throw new Error('TOGGLE_LIKE_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
      }
    }
  }
  
  module.exports = ToggleLikeComment;