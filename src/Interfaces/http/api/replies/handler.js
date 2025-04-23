const AddReplyUseCase = require("../../../../Applications/use_case/AddReplyUseCase");
const DeleteReplyUseCase = require("../../../../Applications/use_case/DeleteReplyUseCase");

class RepliesHandler {
  constructor(container) {
    this._container = container;
    this.postReplyHandler = this.postReplyHandler.bind(this);
    this.deleteReplyHandler = this.deleteReplyHandler.bind(this);
  }

  async postReplyHandler(request, h) {
    const { content } = request.payload;
    const { threadId, commentId } = request.params;
    const { id: owner } = request.auth.credentials;
    const addReplyUseCase = this._container.getInstance(AddReplyUseCase.name);
    const addedReply = await addReplyUseCase.execute({
      content,
      threadId,
      commentId,
      owner,
    });

    return h
      .response({
        status: "success",
        data: { addedReply },
      })
      .code(201);
  }

  async deleteReplyHandler(request, h) {
    const { replyId, commentId, threadId } = request.params;
    const { id: owner } = request.auth.credentials;

    const useCasePayload = { replyId, commentId, threadId, owner };

    const deleteReplyUseCase = this._container.getInstance(
      DeleteReplyUseCase.name
    );
    await deleteReplyUseCase.execute(useCasePayload);

    return {
      status: "success",
    };
  }
}

module.exports = RepliesHandler;
