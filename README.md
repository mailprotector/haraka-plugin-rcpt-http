# haraka-plugin-rcpt-http
A Haraka plugin for validating recipient addresses against an HTTP endpoint.

## Install

Install with npm
```bash
npm install @mailprotector/haraka-plugin-rcpt-http --save
```

## Setup
### Enable Plugin
Add to `plugin` file in the haraka config folder
```text
@mailprotector/haraka-plugin-rcpt-http
```

### Config

Config options are set in `rcpt_http.json`:

| Parameter      | Description                         | Type   | Default Value |
| -------------- | ----------------------------------- | ------ | ------------- |
| USERNAME       | HTTP server username                | string | none          |
| PASSWORD       | HTTP server password                | string | none          |
| RCPT_CHECK_URL | The URL endpoint of the HTTP server | string | none          |

## Details
The http API call uses a `POST` to `RCPT_URL` with `basic auth` if a USERNAME and PASSWORD are provided in config.
Without the User/Pass will do an unauthenticated POST to RCPT_URL.

The following POST body will be sent to RCPT_URL
```js
{
  email: params[0].original,
  ip: connection.remote.ip
}
```

##
![alt text](https://mailprotector.com/wp-content/uploads/2022/07/MP-Left-RGB.png)
[About Mailprotector](https://mailprotector.com/about-mailprotector)
