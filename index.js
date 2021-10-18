(() => {

  exports.register = function () {
    this.register_hook('rcpt', 'rcpt_http');
    this.load_config();
  }

  exports.load_config = function () {
    console.log('loading');
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

      const handleError = err => {
        if (err != undefined) {
          console.log('hit');
          console.log(connection);
          plugin.logerror(err.message || err, connection);
        }
        console.log('hit 2');
        next(DENYSOFT);
      }

      const body = {
        email: connection.transaction.rcpt_to,
        ip: connection.remote.ip
      };

      const options = {};

      if (plugin.auth == true) {
        options.headers = plugin.authHeaders;
      }

      axios.post(this.cfg.RCPT_URL, body, options).then(response => {
        if (response.data.code >= 200 && response.data.code < 600) {
          next(response.status, response.data.message);
        } else {
          handleError(`INVALID HTTP RESPONSE CODE ${response.data.code}:${response.data.message}`);
        }
      }).catch(err => handleError(err));
    }
  }

  exports.rcpt_http_test = buildRcptHttp;

  exports.rcpt_http = buildRcptHttp(require('axios'));

})();
