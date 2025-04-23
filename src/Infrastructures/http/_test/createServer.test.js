const createServer = require("../createServer");

describe("HTTP server", () => {
  it("should response 404 when request unregistered route", async () => {
    const fakeContainer = {
      getInstance: (name) => {
        const dependencies = {
          jwtStrategy: {
            name: "forum_api",
            scheme: "jwt",
            options: {
              keys: "fake_key",
              verify: { aud: false, iss: false, sub: false },
              validate: async () => ({
                isValid: true,
                credentials: { id: "user-123", username: "dicoding" },
              }),
            },
          },
        };

        return dependencies[name];
      },
    };

    const server = await createServer(fakeContainer);

    const response = await server.inject({
      method: "GET",
      url: "/unregisteredRoute",
    });

    expect(response.statusCode).toEqual(404);
  });

  it("should handle server error correctly", async () => {
    const requestPayload = {
      username: "dicoding",
      fullname: "Dicoding Indonesia",
      password: "super_secret",
    };

    const fakeContainer = {
      getInstance: (name) => {
        const dependencies = {
          jwtStrategy: {
            name: "forum_api",
            scheme: "jwt",
            options: {
              keys: "fake_key",
              verify: { aud: false, iss: false, sub: false },
              validate: async () => ({
                isValid: true,
                credentials: { id: "user-123", username: "dicoding" },
              }),
            },
          },
        };

        return dependencies[name];
      },
    };

    const server = await createServer(fakeContainer);

    const response = await server.inject({
      method: "POST",
      url: "/users",
      payload: requestPayload,
    });

    const responseJson = JSON.parse(response.payload);
    expect(response.statusCode).toEqual(500);
    expect(responseJson.status).toEqual("error");
    expect(responseJson.message).toEqual("terjadi kegagalan pada server kami");
  });
});
