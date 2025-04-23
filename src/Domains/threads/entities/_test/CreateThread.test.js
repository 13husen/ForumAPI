const CreateThread = require('../CreateThread');

describe('CreateThread Entity', () => {
  it('should throw error when payload does not contain needed properties', () => {
    // missing body
    const payload = {
      title: 'Thread Title',
    };

    expect(() => new CreateThread(payload)).toThrowError('CREATE_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload properties have incorrect data types', () => {
    const payload = {
      title: 123,
      body: true,
      owner: 'user-123',
    };

    expect(() => new CreateThread(payload)).toThrowError('CREATE_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create CreateThread object correctly with valid payload', () => {
    const payload = {
      title: 'Valid Title',
      body: 'Valid body content',
      owner: 'user-123',
    };

    const createThread = new CreateThread(payload);

    expect(createThread.title).toEqual(payload.title);
    expect(createThread.body).toEqual(payload.body);
    expect(createThread.owner).toEqual(payload.owner);
  });
});