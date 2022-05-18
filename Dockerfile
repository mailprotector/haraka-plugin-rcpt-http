FROM instrumentisto/haraka

COPY index.js /etc/haraka/plugins/rcpt_http.js
COPY node_modules/ /usr/local/lib/node_modules/
COPY config /etc/haraka/config