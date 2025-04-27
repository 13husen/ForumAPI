const AddThreadUseCase = require("../../../../Applications/use_case/AddThreadUseCase");
const GetThreadDetailUseCase = require("../../../../Applications/use_case/GetThreadDetailUseCase");
const ToggleLikeCommentUseCase = require("../../../../Applications/use_case/ToggleLikeCommentUseCase");

class ThreadsHandler {
  constructor(container) {
    this._container = container;
    this.postThreadHandler = this.postThreadHandler.bind(this);
    this.getThreadByIdHandler = this.getThreadByIdHandler.bind(this);
    this.putLikeCommentHandler = this.putLikeCommentHandler.bind(this);
  }

  async postThreadHandler(request, h) {
    const { id: userId } = request.auth.credentials;
    const addThreadUseCase = this._container.getInstance(AddThreadUseCase.name);
    const addedThread = await addThreadUseCase.execute(request.payload, userId);
    const response = h.response({
      status: "success",
      data: {
        addedThread,
      },
    });
    response.code(201);
    return response;
  }

  async getThreadByIdHandler(request, h) {
    const { threadId } = request.params;
    const getThreadDetailUseCase = this._container.getInstance(
      GetThreadDetailUseCase.name
    );
    const thread = await getThreadDetailUseCase.execute(threadId);

    return {
      status: "success",
      data: {
        thread,
      },
    };
  }

  async putLikeCommentHandler(request, h) {
    const { threadId, commentId } = request.params;
    const { id: userId } = request.auth.credentials;

    const toggleLikeCommentUseCase = this._container.getInstance(
      ToggleLikeCommentUseCase.name
    );

    await toggleLikeCommentUseCase.execute({ threadId, commentId, userId });

    return {
      status: "success",
    };
  }
}

module.exports = ThreadsHandler;
