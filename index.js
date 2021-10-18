(() => {

  exports.register = function () {
    this.register('rcpt', 'rcpt_http');
    this.load_config();
  }

  exports.load_config = () => {
    this.cfg = this.config.get('rcpt_http.json', this.load_config);

    if (this.cfg.USERNAME && this.cfg.PASSWORD) {
      this.auth = true;

      const authString = `${plugin.cfg.PASSWORD}:${plugin.cfg.PASSWORD}`;
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
        if (err) {
          plugin.logerror(err.message || message, connection);
        }
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
        if (response.code >= 200 && response.code < 600) {
          next(response.code, response.message);
        } else {
          handleError('HTTP RESPONSE CODE INVALID');
        }
      }).catch(err => {
        handleError(err);
      });
    }
  }

  exports.rcpt_http_test = buildRcptHttp;

  exports.rcpt_http = buildRcptHttp(require('axios'));

})();
