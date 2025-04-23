const AddThreadUseCase = require('../AddThreadUseCase');
const CreateThread = require('../../../Domains/threads/entities/CreateThread');
const CreatedThread = require('../../../Domains/threads/entities/CreatedThread');

describe('AddThreadUseCase', () => {
  it('should orchestrate the add thread action correctly', async () => {
    // Arrange
    const payload = { title: 'thread title', body: 'thread body' };
    const userId = 'user-123';

    const mockUser = {
      id: userId,
      username: 'dicoding',
      fullname: 'Dicoding Indonesia',
    };

    const createdThreadData = {
      id: 'thread-123',
      title: payload.title,
      body: payload.body,
      owner: userId,
    };
    
    const mockThreadRepository = {
      addThread: jest.fn().mockResolvedValue(new CreatedThread(createdThreadData)),
    };

    const mockUserRepository = {
      getUserById: jest.fn().mockResolvedValue({ ...mockUser }),
    };

    const addThreadUseCase = new AddThreadUseCase({
      threadRepository: mockThreadRepository,
      userRepository: mockUserRepository,
    });

    const expectedCreatedThread = new CreatedThread(createdThreadData);

    // Act
    const result = await addThreadUseCase.execute(payload, userId);

    // Assert
    expect(mockUserRepository.getUserById).toHaveBeenCalledWith(userId);
    expect(mockThreadRepository.addThread).toHaveBeenCalledWith(
      expect.any(CreateThread),
      mockUser
    );
    expect(result).toStrictEqual(expectedCreatedThread);
  });
});