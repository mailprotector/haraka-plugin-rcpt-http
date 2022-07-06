((utils, the_axios ) => {
    exports.register = function () {
        const plugin = this;
        plugin.inherits('auth/auth_base');
        plugin.load_tls_ini();
        plugin.load_config();
    }

    exports.load_config = function() {
        const plugin = this;

        plugin.cfg = plugin.cfg.get('http-auth.json', () => {
            plugin.load_config();
        });
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

    const checkAuthFromServer = (URL, body, options, connection, next) => {
        axios.post(URL || process.env.AUTH_CHECK_URL, body, options).then(response => {
            if (response.status != 200) { return next(false); }
            next(true);
        }).catch(err => { next(false); });
    };

    const checkUserValid = (plugin, connection) => {
        let domain;
        if ((domain = /@([^@]+)$/.exec(user))) {
            domain = domain[1].toLowerCase();
        } else {
            connection.logwarning(plugin, `AUTH user="${user}" error="not in required format"`);
            return next(false);
        }
    };

    const buildOptions = (plugin) => {
        const authString = `actionmailbox:${plugin.cfg.ACTION_MAILBOX_PASSWORD}`;
        const authBase64 = new Buffer.from(authString).toString('base64');

        const options = {
            headers: {
                'Content-Type': 'message/rfc822',
                'User-Agent': plugin.cfg.USER_AGENT,
                'Authorization': `Basic ${authBase64}`
            }
        };

        return options;
    };

    const buildCheckPlainPasswdFunc = (axios) => {
        return function (connection, user, passwd, next) {
            const plugin = this;
            checkUserValid(plugin, connection, next);

            const body = { user: user.toLowerCase(), pass: passwd };
            checkAuthFromServer(axios, plugin.cfg.URL, body, buildOptions(this), connection, next);
        }
    };

    // haraka's required exports func
    exports.check_plain_passwd = buildCheckPlainPasswdFunc(the_axios);
    
    exports.buildOptions = buildOptions;
    exports.checkUserValid = checkUserValid;
    exports.buildCheckPlainPasswdFunc = buildCheckPlainPasswdFunc;
})(require('haraka-utils'), require('axios'));