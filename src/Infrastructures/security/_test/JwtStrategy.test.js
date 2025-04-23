const JwtStrategy = require('../JwtStrategy');

describe('JwtStrategy', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    process.env = { ...OLD_ENV };
    process.env.ACCESS_TOKEN_KEY = 'dummy_key';
    process.env.ACCESS_TOKEN_AGE = '3600';
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  it('should initialize with correct name, scheme, and options', () => {
    const strategy = new JwtStrategy();

    expect(strategy.name).toBe('forum_api');
    expect(strategy.scheme).toBe('jwt');

    expect(strategy.options.keys).toBe('dummy_key');
    expect(strategy.options.verify).toEqual({
      aud: false,
      sub: false,
      iss: false,
      maxAgeSec: '3600',
    });

    const artifacts = {
      decoded: {
        payload: {
          id: 'user-123',
        },
      },
    };

    const validation = strategy.options.validate(artifacts);
    expect(validation.isValid).toBe(true);
    expect(validation.credentials).toEqual({ id: 'user-123' });
  });
});
