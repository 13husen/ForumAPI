const ToggleLikeComment = require("../../Domains/comment-likes/entities/ToggleLikeComment");

class ToggleLikeCommentUseCase {
  constructor({ threadRepository, commentRepository, commentLikeRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._commentLikeRepository = commentLikeRepository;
  }

  async execute(useCasePayload) {
    const toggleLikeComment = new ToggleLikeComment(useCasePayload);

    await this._threadRepository.verifyThreadExists(toggleLikeComment.threadId);
    await this._commentRepository.verifyCommentExists(toggleLikeComment.commentId);

    const isLiked = await this._commentLikeRepository.hasUserLikedComment(
      toggleLikeComment.commentId,
      toggleLikeComment.userId
    );

    if (isLiked) {
      await this._commentLikeRepository.unlikeComment(toggleLikeComment.commentId, toggleLikeComment.userId);
    } else {
      await this._commentLikeRepository.likeComment(toggleLikeComment.commentId, toggleLikeComment.userId);
    }
  }
}

module.exports = ToggleLikeCommentUseCase;
