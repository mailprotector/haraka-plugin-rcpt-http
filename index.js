((utils, the_real_axios ) => {
    exports.register = function () {
        const plugin = this;
        plugin.inherits('auth/auth_base');
        plugin.load_tls_ini(plugin);
        plugin.load_config(plugin);
    }

    exports.load_config = function(plugin) {
        plugin.config = plugin.cfg.get('http-auth.json', plugin.load_config);
    }

    exports.load_tls_ini = function (plugin) {
        plugin.tls_cfg = plugin.config.get('tls.ini', plugin.load_tls_ini);
    }

    exports.hook_capabilities = (next, connection) => {
        if (connection.tls.enabled) {
            const methods = ['PLAIN', 'LOGIN'];
            connection.capabilities.push(`AUTH ${methods.join(' ')}`);
            connection.notes.allowed_auth_methods = methods;
        }
        next();
    }

    const checkAuthFromServer = (axios, plugin, body, options, next) => {
        axios.post(plugin.config.AUTH_CHECK_URL || process.env.AUTH_CHECK_URL, body, options).then(response => {
            if (response.status != 200) { 
                plugin.logwarning(JSON.stringify(response.data));
                return next(false);
            }
            next(true);
        }).catch(err => { next(false); });
    };

    const checkUserValid = (plugin, connection) => {
        let domain;
        if ((domain = /@([^@]+)$/.exec(user))) {
            domain = domain[1].toLowerCase();
        } else {
            plugin.logwarning(`AUTH user="${user}" error="not in required format"`);
            return next(false);
        }
    };

    const buildOptions = (plugin) => {
        const authString = `actionmailbox:${plugin.config.ACTION_MAILBOX_PASSWORD}`;
        const authBase64 = new Buffer.from(authString).toString('base64');

        const options = {
            headers: {
                'Content-Type': 'message/rfc822',
                'User-Agent': plugin.config.USER_AGENT,
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
            checkAuthFromServer(axios, plugin, body, buildOptions(plugin), next);
        }
    };

    exports.buildOptions = buildOptions;
    exports.checkUserValid = checkUserValid;
    exports.checkAuthFromServer = checkAuthFromServer;
    exports.buildCheckPlainPasswdFunc = buildCheckPlainPasswdFunc;
    // haraka's required exports func
    exports.check_plain_passwd = buildCheckPlainPasswdFunc(the_real_axios);
})(require('haraka-utils'), require('axios'));