AFTER CONFIG ON GITHUB (NEW WORKFLOW)

- sudo ./svc.sh install
- sudo ./svc.sh start

Update packages

- sudo apt update

Install node

- curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
- node -v
- npm -v

install pm2

- sudo npm i -g pm2

check pm2

- pm2

Configure Proxy
cd /etc/nginx/sites-available

CONFIGURE NGINX
location / {
proxy_pass http://localhost:3000;
proxy_set_header Host $host;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
}

Test / restart nginx
sudo nginx -t
sudo systemctl reload nginx
