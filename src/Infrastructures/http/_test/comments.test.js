const pool = require('../../database/postgres/pool');
const createServer = require('../createServer');
const container = require('../../container');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ServerTestHelper = require('../../../../tests/ServerTestHelper');

describe('/threads/{threadId}/comments endpoint', () => {
  afterAll(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  describe('POST /threads/{threadId}/comments', () => {
    it('should respond 201 and persisted comment', async () => {
      const accessToken = await ServerTestHelper.getAccessToken({ username: 'dicodingusera', password: 'pass a', fullname: 'UserA' });
      const user = await ServerTestHelper.decodeAccessToken(accessToken);
      const server = await createServer(container);
      const { thread_id } = await ThreadsTableTestHelper.addThread({
        title: 'thread title',
        body: 'thread body',
        owner: user,
      });

      const requestPayload = {
        content: 'sebuah komentar',
      };

      const response = await server.inject({
        method: 'POST',
        url: `/threads/${thread_id}/comments`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedComment).toBeDefined();
    });

    it('should respond 400 when payload is missing content', async () => {
      const accessToken = await ServerTestHelper.getAccessToken();
      const server = await createServer(container);
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      const { thread_id } = await ThreadsTableTestHelper.addThread({
        title: 'thread title',
        body: 'thread body',
        owner: 'user-123',
      });

      const response = await server.inject({
        method: 'POST',
        url: `/threads/${thread_id}/comments`,
        payload: {},
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
    });

    it('should respond 401 when no access token is provided', async () => {
      const server = await createServer(container);
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      
      const { thread_id } = await ThreadsTableTestHelper.addThread({
        title: 'thread title',
        body: 'thread body',
        owner: 'user-123',
      });

      const response = await server.inject({
        method: 'POST',
        url: `/threads/${thread_id}/comments`,
        payload: { content: 'komentar' },
      });

      expect(response.statusCode).toEqual(401);
    });
  });

  describe('DELETE /threads/{threadId}/comments/{commentId}', () => {
    it('should respond 200 and delete the comment', async () => {
      const accessToken = await ServerTestHelper.getAccessToken();
      const decodedToken = await ServerTestHelper.decodeAccessToken(accessToken);
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      const server = await createServer(container);

      const { thread_id } = await ThreadsTableTestHelper.addThread({
        title: 'judul',
        body: 'isi',
        owner: decodedToken,
      });


      const { comment_id } = await CommentsTableTestHelper.addComment({
        content: 'komentar saya',
        threadId: thread_id,
        ownerId: decodedToken,
      });

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${thread_id}/comments/${comment_id}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });

    it('should respond 403 when trying to delete another user\'s comment', async () => {
      const accessTokenUserA = await ServerTestHelper.getAccessToken({ username: 'userA', password: 'pass-a', fullname: 'User A' });
      const accessTokenUserB = await ServerTestHelper.getAccessToken({ username: 'userB', password: 'pass-b', fullname: 'User B' });
      const userA = await ServerTestHelper.decodeAccessToken(accessTokenUserA);
      const userB = await ServerTestHelper.decodeAccessToken(accessTokenUserB);
      const server = await createServer(container);

      const { thread_id } = await ThreadsTableTestHelper.addThread({
        title: 'judul',
        body: 'isi',
        owner: userB,
      });

      const { comment_id } = await CommentsTableTestHelper.addComment({
        content: 'komentar userA',
        threadId: thread_id,
        ownerId: userA,
      });

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${thread_id}/comments/${comment_id}`,
        headers: {
          Authorization: `Bearer ${accessTokenUserB}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual('fail');
    });
  });
});
