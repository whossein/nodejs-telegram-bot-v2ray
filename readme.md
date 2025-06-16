# Node.js Telegram Bot for V2Ray Management

[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-ISC-yellow.svg)](LICENSE)

A powerful Node.js Telegram bot for managing V2Ray panels with multi-panel support, automatic failover, and secure configuration management.

## ✨ Features

- 🤖 **Telegram Bot Integration** - Complete bot interface for V2Ray management
- 🔄 **Multi-Panel Support** - Manage multiple V2Ray panels with load balancing
- 🛡️ **Secure Configuration** - JSON-based config with environment variable support
- 🏥 **Health Monitoring** - Automatic panel health checks and failover
- 📊 **User Management** - Create, modify, and monitor V2Ray users
- 🔍 **Real-time Monitoring** - Track usage, status, and performance
- 🗄️ **SQLite Database** - Lightweight, file-based data storage
- 🔒 **Security First** - Encrypted credentials and secure deployment

## 🚀 Quick Start

### Prerequisites

- Node.js 18.x LTS or higher
- npm or yarn package manager
- Linux server (Ubuntu/Debian recommended)

### Installation

```bash
# Clone the repository
git clone https://github.com/whossein/nodejs-telegram-bot-v2ray.git
cd nodejs-telegram-bot-v2ray

# Install dependencies
npm install

# Set up configuration
npm run config:setup

# Build the project
npm run build

# Start the bot
npm start
```

## ⚙️ Configuration

### Panel Configuration

The bot uses a secure JSON-based configuration system for managing V2Ray panels:

```bash
# Set up panel configurations
npm run config:setup

# Edit your panel settings
nano config/secure/panel-configs.json
```

**Example Configuration:**

```json
{
  "panelConfigs": [
    {
      "id": "panel_1",
      "username": "admin",
      "password": "your_secure_password",
      "baseUrl": "https://your-panel.com:8443/path",
      "isActive": true,
      "priority": 1,
      "isHealthy": true,
      "description": "Primary V2Ray panel"
    }
  ],
  "settings": {
    "healthCheckInterval": 300000,
    "maxRetries": 3,
    "connectionTimeout": 30000
  }
}
```

### Environment Variables (Recommended)

For enhanced security, use environment variables:

```bash
# Create .env file
cp .env.template .env

# Edit with your credentials
nano .env
```

```env
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here

# Panel 1 Configuration
PANEL_1_USERNAME=admin
PANEL_1_PASSWORD=your_secure_password
PANEL_1_BASE_URL=https://panel1.example.com:8443/path

# Panel 2 Configuration
PANEL_2_USERNAME=admin
PANEL_2_PASSWORD=your_secure_password
PANEL_2_BASE_URL=https://panel2.example.com:8443/path
```

### Bot Configuration

Edit the bot constants:

```bash
nano config/constant.ts
```

## 📋 Available Scripts

| Script                  | Description                               |
| ----------------------- | ----------------------------------------- |
| `npm start`             | Start the production bot                  |
| `npm run dev`           | Start in development mode with hot reload |
| `npm run build`         | Compile TypeScript to JavaScript          |
| `npm run config:setup`  | Set up JSON configuration system          |
| `npm run config:export` | Export database config to JSON            |
| `npm run config:test`   | Test configuration system                 |
| `npm run test:panels`   | Test panel connections                    |
| `npm run migrate`       | Run database migrations                   |

## 🏗️ Project Structure

```
├── config/                 # Configuration files
│   ├── secure/             # Secure panel configurations
│   ├── constant.ts         # Bot constants and settings
│   └── messages.ts         # Bot messages and responses
├── controllers/            # Request controllers
├── services/              # Business logic services
├── models/                # Database models
├── utils/                 # Utility functions
├── scripts/               # Setup and migration scripts
└── types/                 # TypeScript type definitions
```

## 🛠️ Development

### Development Setup

```bash
# Install dependencies
npm install

# Set up development configuration
npm run config:setup

# Start development server
npm run dev
```

### Testing Configuration

```bash
# Test panel configurations
npm run config:test

# Test specific panels
npm run test:panels
```

## 🚀 Production Deployment

### Server Setup

```bash
# Update system
apt-get update -y
apt-get install curl apt-transport-https gnupg2 wget build-essential unzip nano -y

# Install Node.js 18 LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Verify installation
node -v
npm -v
```

### Application Deployment

```bash
# Clone to production directory
cd /var
git clone https://github.com/whossein/nodejs-telegram-bot-v2ray.git
cd nodejs-telegram-bot-v2ray

# Install production dependencies
npm ci --only=production

# Set up configuration
npm run config:setup

# Edit production configuration
nano config/secure/panel-configs.json
nano .env

# Build the application
npm run build

# Test the setup
npm run config:test
```

### Systemd Service

Create a systemd service for automatic startup:

```bash
# Create service file
nano /lib/systemd/system/v2ray-bot.service
```

```ini
[Unit]
Description=Node.js V2Ray Telegram Bot
After=syslog.target network.target

[Service]
Type=simple
User=root
WorkingDirectory=/var/nodejs-telegram-bot-v2ray
Environment=NODE_ENV=production
ExecStart=/usr/bin/node /var/nodejs-telegram-bot-v2ray/index.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
# Enable and start the service
systemctl daemon-reload
systemctl enable v2ray-bot
systemctl start v2ray-bot

# Check status
systemctl status v2ray-bot

# View logs
journalctl -u v2ray-bot -f
```

## 🔒 Security Best Practices

1. **Environment Variables**: Store sensitive data in `.env` files
2. **File Permissions**: Secure configuration files (`chmod 600`)
3. **Network Security**: Use HTTPS for all panel connections
4. **Regular Updates**: Keep dependencies and system updated
5. **Monitoring**: Implement logging and monitoring
6. **Backup**: Regular backups of configuration and data

## 📚 Documentation

- [Panel Configuration Management](config/PANEL_CONFIG_MANAGEMENT.md)
- [Deployment Guide](DEPLOYMENT_GUIDE.md)
- [Migration Documentation](MIGRATION_COMPLETE.md)

## 🔧 Troubleshooting

### Common Issues

**Configuration not loading:**

```bash
# Check file permissions
ls -la config/secure/panel-configs.json

# Validate JSON
cat config/secure/panel-configs.json | jq empty

# Test configuration
npm run config:test
```

**Bot not responding:**

```bash
# Check bot token and permissions
# Verify network connectivity
# Check logs for errors
journalctl -u v2ray-bot -f
```

**Panel connection issues:**

```bash
# Test panel connectivity
npm run test:panels

# Check panel health
curl -k https://your-panel.com:8443/login
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Node.js Telegram Bot API](https://github.com/yagop/node-telegram-bot-api)
- [V2Ray Project](https://www.v2ray.com/)
- [Sequelize ORM](https://sequelize.org/)

## 📞 Support

For support and questions:

- Open an issue on GitHub
- Check the documentation in the `docs/` folder
- Review existing issues and discussions

---

**⚡ Built with ❤️ for the V2Ray community**
