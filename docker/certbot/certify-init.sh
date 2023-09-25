#!/bin/sh

# Waits for proxy to be available, then gets the first certificate.

set -e

# Use netcat (nc) to check port 80, and keep checking every 5 seconds
# until it is available. This is so nginx has time to start before
# certbot runs. proxy is the name of the service in the docker-compose.yml
until nc -z proxy 80; do
    echo "Waiting for proxy..."
    sleep 5s & wait ${!}
done

echo "Getting certificate..."

# this command takes care of the HTTP-01 challenge by placing the challenge
# files in the specified webroot directory.
certbot certonly \
    --webroot \
    --webroot-path "/vol/www/" \
    -d "$DOMAIN" \
    -d "www.$DOMAIN" \
    --email $EMAIL \
    --rsa-key-size 4096 \
    --agree-tos \
    --noninteractive