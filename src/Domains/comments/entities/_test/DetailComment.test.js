const DetailComment = require('../DetailComment');

describe('DetailComment entity', () => {
  it('should create DetailComment object correctly when isDelete is false', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      username: 'dicoding',
      date: '2025-04-22T10:00:00.000Z',
      content: 'ini komentar asli',
      is_delete: false,
    };

    // Action
    const detailComment = new DetailComment(payload);

    // Assert
    expect(detailComment).toEqual({
      id: 'comment-123',
      username: 'dicoding',
      date: '2025-04-22T10:00:00.000Z',
      content: 'ini komentar asli',
    });
  });

  it('should return masked content when isDelete is true', () => {
    // Arrange
    const payload = {
      id: 'comment-456',
      username: 'johndoe',
      date: '2025-04-22T10:01:00.000Z',
      content: 'rahasia',
      is_delete: true,
    };

    // Action
    const detailComment = new DetailComment(payload);

    // Assert
    expect(detailComment).toEqual({
      id: 'comment-456',
      username: 'johndoe',
      date: '2025-04-22T10:01:00.000Z',
      content: '**komentar telah dihapus**',
    });
  });
});
