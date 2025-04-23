// File: AddReply.test.js
const AddReply = require('../AddReply');

describe('AddReply entity', () => {
  it('should create AddReply object correctly', () => {
    // Arrange
    const payload = {
      threadId: 'thread-123',
      commentId: 'comment-456',
      content: 'ini balasan',
      owner: 'user-789',
    };

    // Action
    const addReply = new AddReply(payload);

    // Assert
    expect(addReply.threadId).toEqual(payload.threadId);
    expect(addReply.commentId).toEqual(payload.commentId);
    expect(addReply.content).toEqual(payload.content);
    expect(addReply.owner).toEqual(payload.owner);
  });

  it('should throw error when payload is missing required properties', () => {
    // Arrange
    const payload = {
      threadId: 'thread-123',
      commentId: 'comment-456',
      // content missing
      owner: 'user-789',
    };

    // Action & Assert
    expect(() => new AddReply(payload)).toThrowError('ADDED_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload properties have invalid data types', () => {
    // Arrange
    const payload = {
      threadId: 'thread-123',
      commentId: 'comment-456',
      content: 123,
      owner: 'user-789',
    };

    // Action & Assert
    expect(() => new AddReply(payload)).toThrowError('ADDED_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });
});
