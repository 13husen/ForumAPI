class GetThreadDetailUseCase {
  constructor({ threadRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._replyRepository = replyRepository;
  }

  async execute(threadId) {
    const thread = await this._threadRepository.getThreadById(threadId);
    const comments = await this._threadRepository.getCommentsByThreadId(
      threadId
    );

    const commentIds = comments.map((comment) => comment.id);
    const replies = await this._replyRepository.getRepliesByCommentIds(
      commentIds
    );

    const repliesGrouped = {};
    for (const reply of replies) {
      if (!repliesGrouped[reply.comment_id]) {
        repliesGrouped[reply.comment_id] = [];
      }
      repliesGrouped[reply.comment_id].push({
        id: reply.id,
        content: reply.is_delete ? "**balasan telah dihapus**" : reply.content,
        date: reply.date,
        username: reply.username,
      });
    }

    const commentsWithReplies = comments.map((comment) => ({
      ...comment,
      replies: repliesGrouped[comment.id] || [],
    }));

    return {
      id: thread.id,
      title: thread.title,
      body: thread.body,
      date: thread.date,
      username: thread.username,
      comments: commentsWithReplies,
    };
  }
}

module.exports = GetThreadDetailUseCase;
