### how to deploy

##### install git and more on server

apt-get update -y
apt-get install curl apt-transport-https gnupg2 wget build-essential unzip nano -y

###### install nodejs 18 lts as root user:

curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - &&\
sudo apt-get install -y nodejs

###### pls check nodejs version installed on server

node -v
npm version

#### clone git like this comment

change diractory to /var or another place
`cd /var`
and clone from git
`git clone https://github.com/whossein/nodejs-telegram-bot-v2ray.git`
and change diractory to project
` cd ./nodejs-telegram-bot-v2ray/`
and change config with your confuration
`nano config/constant.ts`
and install dependency with npm
`npm install`
and build project
`npm run build`
and for test project
`npm run dev`

##### create systemfile

`nano /lib/systemd/system/app.service`

and write like this:

```
Description=Node.js Application
After=syslog.target network.target
[Service]
Type=simple
User=root
WorkingDirectory=/root
Environment=NODE_ENV=production
ExecStart=/usr/bin/node /var/nodejs-telegram-bot-v2ray/index.js
Restart=always
[Install]
WantedBy=multi-user.target

```

and save it!

#### and set for run in background

systemctl daemon-reload
systemctl start app
systemctl enable app
systemctl status app

###### thanks for this website `https://blog.eduonix.com/web-programming-tutorials/deploy-node-js-application-linux-server`
