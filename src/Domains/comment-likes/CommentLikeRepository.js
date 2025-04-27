class CommentLikeRepository {
    async hasUserLikedComment(commentId, userId) {
      throw new Error('COMMENT_LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    }
  
    async likeComment(commentId, userId) {
      throw new Error('COMMENT_LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    }
  
    async unlikeComment(commentId, userId) {
      throw new Error('COMMENT_LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    }
  }
  
  module.exports = CommentLikeRepository;