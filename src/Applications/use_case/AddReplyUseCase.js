const AddReply = require("../../Domains/replies/entities/AddReply");

class AddReplyUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(payload) {
    const addReply = new AddReply(payload);
    const { threadId, commentId} = payload;
    await this._threadRepository.verifyThreadExists(threadId);
    await this._commentRepository.verifyCommentExists(commentId);

    const addedReply = await this._replyRepository.addReply(addReply);

    return addedReply;
  }
}

module.exports = AddReplyUseCase;
