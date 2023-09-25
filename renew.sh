#!/bin/sh
set -e

cd /home/ubuntu/erSite
/usr/local/bin/docker-compose -f docker-compose.deploy.yml run --rm certbot certbot renew