((utils, the_axios ) => {
    exports.register = function () {
        const plugin = this;
        plugin.inherits('auth/auth_base');
        plugin.load_tls_ini();
    }

    exports.load_tls_ini = function () {
        const plugin = this;
        plugin.tls_cfg = plugin.config.get('tls.ini', () => {
            plugin.load_tls_ini();
        });
    }

    exports.hook_capabilities = (next, connection) => {
        if (connection.tls.enabled) {
            const methods = ['PLAIN', 'LOGIN'];
            connection.capabilities.push(`AUTH ${methods.join(' ')}`);
            connection.notes.allowed_auth_methods = methods;
        }
        next();
    }

    const buildCheckPlainPasswdFunc = (axios) => {
        return function (connection, user, passwd, next) {
            let domain;
            if ((domain = /@([^@]+)$/.exec(user))) {
                domain = domain[1].toLowerCase();
            } else {
                // AUTH user not in user@domain.com format
                connection.logerror(this, `AUTH user="${user}" error="not in required format"`);
                return next(false);
            }

            const options = {};
            if (plugin.auth == true) {
                options.headers = plugin.authHeaders;
            }

            const body = { user, pass: passwd };
            axios.post(this.cfg.URL || process.env.AUTH_CHECK_URL, body, options).then(response => {
                if (response.status != 200) {
                    return next(false);
                }
                next(true);
            }).catch(err => {
                next(false);
            })

            next();
        }
    };

    exports.check_plain_passwd = buildCheckPlainPasswdFunc(the_axios);
})(require('haraka-utils'), require('axios'));