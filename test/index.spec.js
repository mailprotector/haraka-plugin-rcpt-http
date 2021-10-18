const { rcpt_http_test, load_config, register } = require('../index');

global.DENYSOFT = 450;

describe('register', () => {
  test('registers plugin and loads config', () => {
    const registerHookMock = jest.fn(() => {});
    const loadConfigMock = jest.fn(() => {});

    class TestClass  {
      constructor() {
        this.register_hook = registerHookMock;
        this.load_config = loadConfigMock;
      }
    };

    testFunc = new TestClass();
    testFunc.register = register;
    testFunc.register();

    expect(registerHookMock.mock.calls[0][0]).toEqual('rcpt');
    expect(registerHookMock.mock.calls[0][1]).toEqual('rcpt_http');
    expect(registerHookMock.mock.calls[0][3]).toEqual(undefined);
    expect(registerHookMock.mock.calls[1]).toEqual(undefined);

    expect(loadConfigMock.mock.calls[0]).toEqual([]);
  });
});

describe('load_config', () => {
  test('success with all config values', () => {
    const getConfigMock = jest.fn(() => ({
      USERNAME: 'USERNAME',
      PASSWORD: 'PASSWORD',
      RCPT_URL: 'RCPT_URL'
    }));

    const logWarningMock = jest.fn(() => {});

    class TestClass  {
      constructor() {
        this.config = { get: getConfigMock };
      }
    };

    testFunc = new TestClass();
    testFunc.load_config = load_config;
    testFunc.load_config();

    expect(getConfigMock.mock.calls[0][0]).toEqual('rcpt_http.json');
  });
});

// describe('rcpt_http', () => {
//
//   test('register', () => {
//
//   });
//
// });
