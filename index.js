(() => {

  exports.register = function () {
    this.register_hook('rcpt', 'rcpt_http');
    this.register_hook('init_master', 'load_config');
  }

  exports.load_config = function () {
    this.cfg = this.config.get('rcpt_http.json', this.load_config);
    if (this.cfg.USERNAME && this.cfg.PASSWORD) {
      this.auth = true;

      const authString = `${this.cfg.PASSWORD}:${this.cfg.PASSWORD}`;
      const authBase64 = new Buffer.from(authString).toString('base64');

      this.authHeaders = {
        Authorization: `Basic ${authBase64}`,
      };
    } else {
      this.auth = false;
    }
  };

  const buildRcptHttp = axios => {
    return function (next, connection) {
      const plugin = this;

      const body = {
        email: connection.transaction.rcpt_to,
        ip: connection.remote.ip
      };

      const options = {};

      if (plugin.auth == true) {
        options.headers = plugin.authHeaders;
      }

      axios.post(this.cfg.URL, body, options).then(response => {
        if (response.status >= 200 && response.status < 600) {
          if (response.data.code == undefined) {
            next(DENYSOFT);
          } else {
            next(response.data.code, response.data.message);
          }
        } else {
          next(DENYSOFT, `Backend failure. Please, retry later ${response.status}`);
        }
      }).catch(err => {
        if (err != undefined) {
          connection.logerror(err.message || err);
        }
        next(DENYSOFT, 'Backend failure. Please, retry later');
      });
    }
  }

  exports.rcpt_http_test = buildRcptHttp;

  exports.rcpt_http = buildRcptHttp(require('axios'));

})();
