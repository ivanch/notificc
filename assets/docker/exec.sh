#!/bin/sh

if [[ -z "${SSL_CERT}" ]]; then
    nginx
else
    nginx
fi
uwsgi --ini /api/wsgi.ini