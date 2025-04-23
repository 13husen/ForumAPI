const CreateComment = require('../../Domains/comments/entities/CreateComment');

class AddCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(payload, threadId, ownerId) {
    const createComment = new CreateComment(payload);
    await this._threadRepository.verifyThreadExists(threadId);
    return this._commentRepository.addComment(createComment, threadId, ownerId);
  }
}

module.exports = AddCommentUseCase;