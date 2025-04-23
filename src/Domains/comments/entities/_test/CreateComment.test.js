const CreateComment = require('../CreateComment');

describe('CreateComment', () => {
  it('should throw error if content is not provided', () => {
    const payload = {}; 
    expect(() => new CreateComment(payload)).toThrowError('CREATE_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error if content is not a string', () => {
    const payload = { content: 123 };
    expect(() => new CreateComment(payload)).toThrowError('CREATE_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create CreateComment instance correctly when content is valid', () => {
    const payload = { content: 'This is a comment' };
    const createComment = new CreateComment(payload);

    expect(createComment).toBeInstanceOf(CreateComment);
    expect(createComment.content).toBe('This is a comment');
  });
});