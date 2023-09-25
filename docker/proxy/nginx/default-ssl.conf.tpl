limit_req_zone $binary_remote_addr 
          zone=limitbyaddr:10m rate=1r/s;
limit_req_status 429;

server {
  listen 80;
  server_name ${DOMAIN} www.${DOMAIN};

  location /.well-known/acme-challenge/ {
    root /vol/www/;
  }

  location / {
    return 301 https://$host$request_uri;
  }
}

upstream zap {
  server web:8001;
}

server {
  listen      443 ssl;
  server_name ${DOMAIN} www.${DOMAIN};

  access_log /var/log/nginx/access.log;
  limit_req zone=limitbyaddr burst=10 delay=5;

  ssl_certificate     /etc/letsencrypt/live/${DOMAIN}/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/${DOMAIN}/privkey.pem;

  include     /etc/nginx/options-ssl-nginx.conf;

  ssl_dhparam /vol/proxy/ssl-dhparams.pem;

  add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

  location /static/ {
    alias /home/app/static/;
    # # Proxy requests for static files to the cloud storage provider's URL
    # proxy_pass https://cloud-storage-provider.com/bucket-name/;
    # proxy_set_header Host $host;
    # proxy_set_header X-Real-IP $remote_addr;
    # proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }

  location /media/ {
    alias /home/app/media/;
  }

  location /media_private/ {
    internal;
    alias /home/app/priv_files/;
  }
  
  location / {
    proxy_pass http://zap;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "Upgrade";
    proxy_set_header Host $host;    # this line transmits the host to django for allowed_hosts to work
    proxy_set_header X-Forwarded-Proto $scheme; # this tells django if request is http or https, see HTTP_X_FORWARDED_PROTO setting
    client_max_body_size 2M;
    proxy_no_cache 1;
  }
}