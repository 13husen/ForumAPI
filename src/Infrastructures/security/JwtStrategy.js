class JwtStrategy {
  constructor() {
    this.name = "forum_api";
    this.scheme = "jwt";
    this.options = {
      keys: process.env.ACCESS_TOKEN_KEY,
      verify: {
        aud: false,
        sub: false,
        iss: false,
        maxAgeSec: process.env.ACCESS_TOKEN_AGE,
      },
      validate: (artifacts) => ({
        isValid: true,
        credentials: {
          id: artifacts.decoded.payload.id,
        },
      }),
    };
  }
}

module.exports = JwtStrategy;
