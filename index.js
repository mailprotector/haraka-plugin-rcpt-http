(() => {

  exports.register = function () {
    this.register_hook('rcpt', 'rcpt_http');
    this.load_config();
  }

  exports.load_config = function () {
    const plugin = this;

    try {
      plugin.cfg = this.config.get('rcpt-http.json', plugin.load_config);
    } catch (err) { }

    if (plugin.cfg.URL == undefined) {
      plugin.cfg.URL = process.env.RCPT_CHECK_URL;
    }

    if (plugin.cfg.USERNAME == undefined) {
      plugin.cfg.USERNAME = process.env.USERNAME;
    }

    if (plugin.cfg.PASSWORD == undefined) {
      plugin.cfg.PASSWORD = process.env.PASSWORD;
    }

    if (plugin.cfg.USERNAME !== undefined && plugin.cfg.PASSWORD !== undefined) {
      plugin.auth = true;

      const authString = `${plugin.cfg.PASSWORD}:${plugin.cfg.PASSWORD}`;
      const authBase64 = new Buffer.from(authString).toString('base64');

      plugin.authHeaders = {
        Authorization: `Basic ${authBase64}`,
      };
    } else {
      plugin.auth = false;
    }
  };

  function buildRcptHttp(axios, statusCodes) {
    return function (next, connection, params) {
      const plugin = this;

      const body = {
        email: params[0].original,
        ip: connection.remote.ip
      };

      const options = {};

      if (plugin.auth == true) {
        options.headers = plugin.authHeaders;
      }

      axios.post(this.cfg.URL || process.env.RCPT_CHECK_URL, body, options).then(response => {
        if (response.status >= 200 && response.status < 600) {
          if (response.data.code == undefined) {
            next(DENYSOFT);
          } else {
            next(statusCodes[response.data.code], response.data.message);
          }
        } else {
          next(DENYSOFT, `Backend failure. Please, retry later ${response.status}`);
        }
      }).catch(err => {
        if (err != undefined) {
          plugin.logerror(err.message || err);
        }
        next(DENYSOFT, 'Backend failure. Please, retry later');
      });
    }
  }

  exports.rcpt_http_test = buildRcptHttp;
  exports.rcpt_http = buildRcptHttp(require('axios'), {
    OK: OK,
    DENYSOFT: DENYSOFT,
    DENY: DENY
  });

})();
