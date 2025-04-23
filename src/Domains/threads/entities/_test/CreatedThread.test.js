const CreatedThread = require("../CreatedThread");

CreatedThread
describe('CreatedThread', () => {
  it('should create CreatedThread object correctly', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'Thread Title',
      body: 'Thread body content',
      owner: 'user-123',
    };

    // Action
    const createdThread = new CreatedThread(payload);

    // Assert
    expect(createdThread).toBeInstanceOf(CreatedThread);
    expect(createdThread.id).toEqual(payload.id);
    expect(createdThread.title).toEqual(payload.title);
    expect(createdThread.body).toEqual(payload.body);
    expect(createdThread.owner).toEqual(payload.owner);
  });
});