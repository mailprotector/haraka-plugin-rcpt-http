const { rcpt_http_test, load_config, register } = require('../index');

global.DENYSOFT = 450;
global.OK = 200;

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
    expect(registerHookMock.mock.calls[1]).toEqual(["init_master", "load_config"]);

    expect(loadConfigMock.mock.calls[0]).toEqual(undefined);
  });
});

describe('load_config', () => {
  test('success with all config values', () => {
    const getConfigMock = jest.fn(() => ({
      USERNAME: 'USERNAME',
      PASSWORD: 'PASSWORD',
      URL: 'URL'
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

describe('rcpt_http', () => {
  test('response OK with a OK code', testComplete => {
    const axiosMock = {
      post: jest.fn(() => {
        return new Promise(function(resolve, reject) {
          resolve({
            status: 200,
            data: {
              code: OK,
              message: 'test_message'
            }
          });
        });
      })
    };

    const transaction = {
      rcpt_to: 'to-addr',
    };

    const remote = {
      ip: '192.168.0.1',
      host: 'testhost'
    };

    const logerror = msg => {
      console.log(msg);
    };

    const hello = { host: 'hello-host' };

    const connection = { transaction, remote, hello, logerror };

    const next = (statusCode, reason) => {
      try {
        expect(statusCode).toEqual(OK);
        expect(reason).toEqual('test_message');

        expect(axiosMock.post.mock.calls[0][0]).toEqual('URL');

        const expectedBody = {
          email: transaction.rcpt_to,
          ip: remote.ip
        };

        expect(axiosMock.post.mock.calls[0][1]).toEqual(expectedBody);
        expect(axiosMock.post.mock.calls[0][2]).toEqual({ headers: { test: 'ing' } });
        expect(axiosMock.post.mock.calls[1]).toEqual();
      } catch (err) {
        console.log(err);
      }

      testComplete();
    };

    class TestClass  {
      constructor() {
        this.cfg = {
          URL: 'URL'
        };

        this.auth = true;
        this.authHeaders = { test: 'ing' };
      };
    };

    testFunc = new TestClass();
    testFunc.rcpt_http = rcpt_http_test(axiosMock);

    testFunc.rcpt_http(next, connection);
  });

  test('denysoft with an invalid response code', testComplete => {
    const axiosMock = {
      post: jest.fn(() => {
        return new Promise(function(resolve, reject) {
          resolve({
            status: 9000,
            data: {
              code: OK,
              message: 'test_message'
            }
          });
        });
      })
    };

    const transaction = {
      rcpt_to: 'to-addr',
    };

    const remote = {
      ip: '192.168.0.1',
      host: 'testhost'
    };

    const logerror = msg => {
      console.log(msg);
    };

    const hello = { host: 'hello-host' };

    const connection = { transaction, remote, hello, logerror };

    const next = (statusCode, reason) => {
      try {
        expect(statusCode).toEqual(DENYSOFT);
        expect(reason).toEqual('Backend failure. Please, retry later 9000');

        expect(axiosMock.post.mock.calls[0][0]).toEqual('URL');

        const expectedBody = {
          email: transaction.rcpt_to,
          ip: remote.ip
        };

        expect(axiosMock.post.mock.calls[0][1]).toEqual(expectedBody);
        expect(axiosMock.post.mock.calls[0][2]).toEqual({ headers: { test: 'ing' } });
        expect(axiosMock.post.mock.calls[1]).toEqual(undefined);
      } catch (err) {
        console.log(err);
      }

      testComplete();
    };

    class TestClass  {
      constructor() {
        this.cfg = {
          URL: 'URL'
        };

        this.auth = true;
        this.authHeaders = { test: 'ing' };
      }
    };

    testFunc = new TestClass();
    testFunc.rcpt_http = rcpt_http_test(axiosMock);

    testFunc.rcpt_http(next, connection);
  });

  test('denysoft with an http error', testComplete => {
    const axiosMock = {
      post: jest.fn(() => {
        return new Promise(function(resolve, reject) {
          reject({ message: 'PHAILURE' });
        });
      })
    };

    const transaction = {
      rcpt_to: 'to-addr',
    };

    const remote = {
      ip: '192.168.0.1',
      host: 'testhost'
    };

    const logerror = msg => {
      // console.log(msg);
    };

    const hello = { host: 'hello-host' };

    const connection = { transaction, remote, hello, logerror };

    const next = (statusCode, reason) => {
      try {
        expect(statusCode).toEqual(DENYSOFT);
        expect(reason).toEqual('Backend failure. Please, retry later');
        expect(axiosMock.post.mock.calls[0][0]).toEqual('URL');

        const expectedBody = {
          email: transaction.rcpt_to,
          ip: remote.ip
        };

        expect(axiosMock.post.mock.calls[0][1]).toEqual(expectedBody);
        expect(axiosMock.post.mock.calls[0][2]).toEqual({ headers: { test: 'ing' } });
        expect(axiosMock.post.mock.calls[1]).toEqual(undefined);
      } catch (err) {
        console.log(err);
      }

      testComplete();
    };

    class TestClass  {
      constructor() {
        this.cfg = {
          URL: 'URL'
        };

        this.auth = true;
        this.authHeaders = { test: 'ing' };
      }
    };

    testFunc = new TestClass();
    testFunc.rcpt_http = rcpt_http_test(axiosMock);

    testFunc.rcpt_http(next, connection);
  });
});
