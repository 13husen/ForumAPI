const createServer = require("../src/Infrastructures/http/createServer");
const container = require("../src/Infrastructures/container");
const Jwt = require("@hapi/jwt");
const ServerTestHelper = {
  async getAccessToken({
    username = "testuser",
    password = "secret",
    fullname = "Test User",
  } = {}) {
    const registerPayload = {
      username,
      password,
      fullname,
    };

    const server = await createServer(container);

    await server.inject({
      method: "POST",
      url: "/users",
      payload: registerPayload,
    });

    const response = await server.inject({
      method: "POST",
      url: "/authentications",
      payload: {
        username: registerPayload.username,
        password: registerPayload.password,
      },
    });

    const responseJson = JSON.parse(response.payload);
    return responseJson.data.accessToken;
  },

  async decodeAccessToken(token) {
    const decoded = Jwt.token.decode(token);
    const userId = decoded?.decoded?.payload?.id;
    return userId;
  },
};

module.exports = ServerTestHelper;
