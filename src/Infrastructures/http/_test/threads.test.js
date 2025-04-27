const pool = require('../../database/postgres/pool');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const createServer = require('../createServer');
const container = require('../../container');
const ServerTestHelper = require('../../../../tests/ServerTestHelper');

describe('/threads endpoint', () => {
  afterAll(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  describe('when POST /threads', () => {
    it('should response 201 and persisted thread', async () => {
      // Arrange
      const accessToken = await ServerTestHelper.getAccessToken();
      const requestPayload = {
        title: 'sebuah thread',
        body: 'isi thread ini',
      };
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedThread).toBeDefined();
    });

    it('should response 400 when payload missing title or body', async () => {
      const accessToken = await ServerTestHelper.getAccessToken();
      const requestPayload = {
        body: 'isi tanpa title',
      };
      const server = await createServer(container);

      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat thread baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 when payload data type not valid', async () => {
      const accessToken = await ServerTestHelper.getAccessToken();
      const requestPayload = {
        title: ['judul array'],
        body: 'isi thread',
      };
      const server = await createServer(container);

      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat thread baru karena tipe data tidak sesuai');
    });

    it('should response 401 when no access token provided', async () => {
      const requestPayload = {
        title: 'judul thread',
        body: 'isi thread',
      };
      const server = await createServer(container);

      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.message).toEqual('Missing authentication');
    });
  });

  describe('when GET /threads/{threadId}', () => {
    it('should response 200 and return thread detail', async () => {
      const accessToken = await ServerTestHelper.getAccessToken({ username: 'dicoding', password: 'passdicoding', fullname: 'Dicoding' });
      const user = await ServerTestHelper.decodeAccessToken(accessToken);
      const server = await createServer(container);

      const { thread_id } = await ThreadsTableTestHelper.addThread({
        title: 'judul',
        body: 'isi',
        owner: user,
      });

      const response = await server.inject({
        method: 'GET',
        url: `/threads/${thread_id}`,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.thread).toBeDefined();
    });

    it('should response 404 if thread not found', async () => {
      const server = await createServer(container);

      const response = await server.inject({
        method: 'GET',
        url: '/threads/non-existent-thread',
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('threads tidak ditemukan di database');
    });
  });

  describe('when PUT /threads/{threadId}/comments/{commentId}/likes', () => {
    it('should response 200 and toggle like successfully', async () => {
      const accessToken = await ServerTestHelper.getAccessToken({ username: 'liker', password: 'passliker', fullname: 'Liker User' });
      const user = await ServerTestHelper.decodeAccessToken(accessToken);
      const server = await createServer(container);

      // buat thread
      const { thread_id } = await ThreadsTableTestHelper.addThread({
        title: 'thread for like',
        body: 'body of thread',
        owner: user,
      });

      // buat komentar
      const { comment_id } = await CommentsTableTestHelper.addComment({
        content: 'comment to be liked',
        thread_id,
        ownerId: user,
      });

      // aksi: like komentar
      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${thread_id}/comments/${comment_id}/likes`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });

    it('should response 404 if thread not found', async () => {
      const accessToken = await ServerTestHelper.getAccessToken();
      const server = await createServer(container);

      const response = await server.inject({
        method: 'PUT',
        url: `/threads/nonexistent-thread/comments/nonexistent-comment/likes`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('threads tidak ditemukan di database');
    });

    it('should response 404 if comment not found', async () => {
      const accessToken = await ServerTestHelper.getAccessToken();
      const user = await ServerTestHelper.decodeAccessToken(accessToken);
      const server = await createServer(container);

      // buat thread
      const { thread_id } = await ThreadsTableTestHelper.addThread({
        title: 'thread for missing comment',
        body: 'thread body',
        owner: user,
      });

      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${thread_id}/comments/nonexistent-comment/likes`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('comment tidak ditemukan di database');
    });

    it('should response 401 when no access token provided', async () => {
      const server = await createServer(container);

      const response = await server.inject({
        method: 'PUT',
        url: `/threads/thread-id/comments/comment-id/likes`,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.message).toEqual('Missing authentication');
    });
  });
});
