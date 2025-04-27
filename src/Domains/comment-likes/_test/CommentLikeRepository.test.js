const CommentLikeRepository = require("../CommentLikeRepository");

describe("CommentLikeRepository interface", () => {
  it("should throw error when invoke abstract behavior", async () => {
    // Arrange
    const commentLikeRepository = new CommentLikeRepository();

    // Action and Assert
    await expect(
      commentLikeRepository.hasUserLikedComment("comment-123", "user-123")
    ).rejects.toThrowError("COMMENT_LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED");

    await expect(
      commentLikeRepository.likeComment("comment-123", "user-123")
    ).rejects.toThrowError("COMMENT_LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED");

    await expect(
      commentLikeRepository.unlikeComment("comment-123", "user-123")
    ).rejects.toThrowError("COMMENT_LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED");
  });
});
