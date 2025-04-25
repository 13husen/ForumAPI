const DeleteReplyUseCase = require('../DeleteReplyUseCase');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

describe('DeleteReplyUseCase', () => {
  let replyRepository;
  let useCase;

  beforeEach(() => {
    replyRepository = {
      verifyReplyExists: jest.fn(),
      verifyReplyOwner: jest.fn(),
      deleteReplyById: jest.fn(),
    };

    useCase = new DeleteReplyUseCase({ replyRepository });
  });

  it('should orchestrate the delete reply action correctly', async () => {
    const payload = { replyId: 'reply-123', owner: 'user-123' };

    replyRepository.verifyReplyExists.mockResolvedValue(true);
    replyRepository.verifyReplyOwner.mockResolvedValue(true);
    replyRepository.deleteReplyById.mockResolvedValue();

    await useCase.execute(payload);

    expect(replyRepository.verifyReplyExists).toHaveBeenCalledWith('reply-123');
    expect(replyRepository.verifyReplyOwner).toHaveBeenCalledWith('reply-123', 'user-123');
    expect(replyRepository.deleteReplyById).toHaveBeenCalledWith('reply-123');
  });

  it('should throw NotFoundError if reply does not exist', async () => {
    const payload = { replyId: 'reply-not-found', owner: 'user-123' };

    replyRepository.verifyReplyExists.mockRejectedValue(new NotFoundError('Reply not found'));

    await expect(useCase.execute(payload)).rejects.toThrow(NotFoundError);

    expect(replyRepository.verifyReplyExists).toHaveBeenCalledWith('reply-not-found');
    expect(replyRepository.verifyReplyOwner).not.toHaveBeenCalled();
    expect(replyRepository.deleteReplyById).not.toHaveBeenCalled();
  });

  it('should throw AuthorizationError if user is not the reply owner', async () => {
    const payload = { replyId: 'reply-123', owner: 'user-wrong' };

    replyRepository.verifyReplyExists.mockResolvedValue();
    replyRepository.verifyReplyOwner.mockRejectedValue(new AuthorizationError('Forbidden access'));

    await expect(useCase.execute(payload)).rejects.toThrow(AuthorizationError);

    expect(replyRepository.verifyReplyExists).toHaveBeenCalledWith('reply-123');
    expect(replyRepository.verifyReplyOwner).toHaveBeenCalledWith('reply-123', 'user-wrong');
    expect(replyRepository.deleteReplyById).not.toHaveBeenCalled();
  });
});