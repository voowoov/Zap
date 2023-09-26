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
  limit_req zone=limitbyaddr burst=20 delay=10;

  ssl_certificate     /etc/letsencrypt/live/${DOMAIN}/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/${DOMAIN}/privkey.pem;

  include     /etc/nginx/options-ssl-nginx.conf;

  ssl_dhparam /vol/proxy/ssl-dhparams.pem;

  add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

  location /static/ {
    alias /home/app/static/;
  }

  location /media/ {
    alias /home/app/media/;
  }

  location /media_private/ {
    internal;
    alias /home/app/priv_files/;
  }
  
  location /flower54321/ {
    proxy_pass http://flower:8888;  # flower, no trailing slash
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }

  location /pgadmin54321/ {
    proxy_set_header X-Script-Name /pgadmin54321; # this informs pgadmin of the parent url
    proxy_pass http://pgadmin:5050/;   # pgadmin, with trailing slash
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }

  location /duplicati54321/ {
    proxy_set_header X-Script-Name /duplicati54321; # this informs pgadmin of the parent url
    proxy_pass http://duplicati:8200/; # duplicati, with trailing slash
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }

  location / {
    proxy_pass http://zap;

    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "Upgrade";

    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme; # this tells django if request is http or https, see HTTP_X_FORWARDED_PROTO setting
    client_max_body_size 2M;
    # proxy_no_cache 1;
  }
}