const pool = require("../../database/postgres/pool");
const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const CommentsTableTestHelper = require("../../../../tests/CommentsTableTestHelper");
const RepliesTableTestHelper = require("../../../../tests/RepliesTableTestHelper");
const createServer = require("../createServer");
const container = require("../../container");
const ServerTestHelper = require("../../../../tests/ServerTestHelper");
const CommentLikesTableTestHelper = require("../../../../tests/CommentLikesTableTestHelper");

describe("/replies endpoint", () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await CommentLikesTableTestHelper.cleanTable();
    await RepliesTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  describe("when POST /threads/{threadId}/replies", () => {
    it("should response 201 and persisted reply", async () => {
      // Arrange
      const accessToken = await ServerTestHelper.getAccessToken();
      const user = await ServerTestHelper.decodeAccessToken(accessToken);

      const { thread_id } = await ThreadsTableTestHelper.addThread({
        title: "sebuah thread",
        body: "isi thread ini",
        owner: user,
      });

      const { comment_id } = await CommentsTableTestHelper.addComment({
        threadId: thread_id,
        content: "komentar utama",
        ownerId: user,
      });

      const requestPayload = {
        content: "This is a reply",
      };

      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: "POST",
        url: `/threads/${thread_id}/comments/${comment_id}/replies`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual("success");
      expect(responseJson.data.addedReply).toBeDefined();
    });

    it("should response 400 when payload missing content", async () => {
      // Arrange
      const accessToken = await ServerTestHelper.getAccessToken();
      const user = await ServerTestHelper.decodeAccessToken(accessToken);

      const { thread_id } = await ThreadsTableTestHelper.addThread({
        title: "sebuah thread",
        body: "isi thread ini",
        owner: user,
      });

      const { comment_id } = await CommentsTableTestHelper.addComment({
        threadId: thread_id,
        content: "komentar utama",
        ownerId: user,
      });

      const requestPayload = {};

      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: "POST",
        url: `/threads/${thread_id}/comments/${comment_id}/replies`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toEqual(
        "tidak dapat membuat reply baru karena properti yang dibutuhkan tidak ada"
      );
    });

    it("should response 400 when payload data type not valid", async () => {
      // Arrange
      const accessToken = await ServerTestHelper.getAccessToken();
      const user = await ServerTestHelper.decodeAccessToken(accessToken);
      const { thread_id } = await ThreadsTableTestHelper.addThread({
        title: "sebuah thread",
        body: "isi thread ini",
        owner: user,
      });
      const { comment_id } = await CommentsTableTestHelper.addComment({
        threadId: thread_id,
        content: "komentar untuk reply",
        ownerId: user,
      });
      const requestPayload = {
        content: ["reply array"],
      };
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: "POST",
        url: `/threads/${thread_id}/comments/${comment_id}/replies`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toEqual(
        "tidak dapat membuat reply baru karena tipe data tidak sesuai"
      );
    });

    it("should response 401 when no access token provided", async () => {
      const accessToken = await ServerTestHelper.getAccessToken();
      const user = await ServerTestHelper.decodeAccessToken(accessToken);
      const { thread_id } = await ThreadsTableTestHelper.addThread({
        title: "sebuah thread",
        body: "isi thread ini",
        owner: user,
      });

      const { comment_id } = await CommentsTableTestHelper.addComment({
        threadId: thread_id,
        content: "komentar awal",
        ownerId: user,
      });

      const requestPayload = {
        content: "This is a reply",
      };

      const server = await createServer(container);

      const response = await server.inject({
        method: "POST",
        url: `/threads/${thread_id}/comments/${comment_id}/replies`,
        payload: requestPayload,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.message).toEqual("Missing authentication");
    });

    it("should respond 200 when successfully delete a reply", async () => {
      const accessToken = await ServerTestHelper.getAccessToken();
      const user = await ServerTestHelper.decodeAccessToken(accessToken);

      const { thread_id } = await ThreadsTableTestHelper.addThread({
        title: "thread untuk delete reply",
        body: "isi thread",
        owner: user,
      });

      const { comment_id } = await CommentsTableTestHelper.addComment({
        threadId: thread_id,
        content: "komentar untuk reply",
        ownerId: user,
      });

      const { reply_id } = await RepliesTableTestHelper.addReply({
        commentId: comment_id,
        content: "balasan yang akan dihapus",
        owner: user,
      });

      const server = await createServer(container);

      const response = await server.inject({
        method: "DELETE",
        url: `/threads/${thread_id}/comments/${comment_id}/replies/${reply_id}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual("success");
    });

    it("should respond 404 when reply does not exist", async () => {
      const accessToken = await ServerTestHelper.getAccessToken();
      const user = await ServerTestHelper.decodeAccessToken(accessToken);
    
      const { thread_id } = await ThreadsTableTestHelper.addThread({
        title: "Thread",
        body: "Isi",
        owner: user,
      });
    
      const { comment_id } = await CommentsTableTestHelper.addComment({
        threadId: thread_id,
        content: "Komentar",
        ownerId: user,
      });
    
      const server = await createServer(container);
    
      const response = await server.inject({
        method: "DELETE",
        url: `/threads/${thread_id}/comments/${comment_id}/replies/xyz-not-exist`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.message).toEqual("Reply tidak ditemukan");
    });

    it("should respond 403 when user is not the reply owner", async () => {
      const tokenUserA = await ServerTestHelper.getAccessToken({ username: 'userA', password: 'pass-a', fullname: 'User A' });
      const tokenUserB = await ServerTestHelper.getAccessToken({ username: 'userB', password: 'pass-b', fullname: 'User B' });
    
      const userA = await ServerTestHelper.decodeAccessToken(tokenUserA);
    
      const { thread_id } = await ThreadsTableTestHelper.addThread({
        title: "Thread",
        body: "Isi",
        owner: userA,
      });
    
      const { comment_id } = await CommentsTableTestHelper.addComment({
        threadId: thread_id,
        content: "Komentar",
        ownerId: userA,
      });
    
      const { reply_id } = await RepliesTableTestHelper.addReply({
        commentId: comment_id,
        content: "Balasan",
        owner: userA,
      });
    
      const server = await createServer(container);
    
      const response = await server.inject({
        method: "DELETE",
        url: `/threads/${thread_id}/comments/${comment_id}/replies/${reply_id}`,
        headers: {
          Authorization: `Bearer ${tokenUserB}`,
        },
      });
    
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.message).toEqual("Anda tidak berhak mengakses resource ini");
    });

    it("should respond 401 when no access token is provided", async () => {
      const accessToken = await ServerTestHelper.getAccessToken();
      const user = await ServerTestHelper.decodeAccessToken(accessToken);
    
      const { thread_id } = await ThreadsTableTestHelper.addThread({
        title: "Thread",
        body: "Isi",
        owner: user,
      });
    
      const { comment_id } = await CommentsTableTestHelper.addComment({
        threadId: thread_id,
        content: "Komentar",
        ownerId: user,
      });
    
      const { reply_id } = await RepliesTableTestHelper.addReply({
        commentId: comment_id,
        content: "Balasan",
        owner: user,
      });
    
      const server = await createServer(container);
    
      const response = await server.inject({
        method: "DELETE",
        url: `/threads/${thread_id}/comments/${comment_id}/replies/${reply_id}`,
      });
    
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.message).toEqual("Missing authentication");
    });
  });
});
