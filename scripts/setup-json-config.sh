#!/bin/bash

# Panel Configuration Setup Script
# This script helps set up the JSON-based panel configuration system

set -e

echo "🚀 Setting up JSON-based Panel Configuration..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

# Create secure config directory
print_status "Creating secure configuration directory..."
mkdir -p config/secure

# Check if panel-configs.json already exists
if [ -f "config/secure/panel-configs.json" ]; then
    print_warning "panel-configs.json already exists. Creating backup..."
    cp config/secure/panel-configs.json config/secure/panel-configs.backup.$(date +%Y%m%d_%H%M%S).json
fi

# Build the project
print_status "Building the project..."
npm run build

# Run export script if database exists
if [ -f "x-ui.db" ] || [ -f "x.db" ]; then
    print_status "Found database files. Exporting existing configurations..."
    if node dist/scripts/export-panel-configs.js; then
        print_status "Successfully exported database configurations to JSON!"
    else
        print_warning "Failed to export from database. Using template instead."
        cp config/secure/panel-configs.template.json config/secure/panel-configs.json
    fi
else
    print_status "No database found. Using template..."
    cp config/secure/panel-configs.template.json config/secure/panel-configs.json
fi

# Set up environment file
print_status "Setting up environment file..."
if [ ! -f ".env" ]; then
    if [ -f ".env.template" ]; then
        cp .env.template .env
        print_status "Created .env file from template"
    else
        print_warning "No .env.template found. You'll need to create .env manually."
    fi
else
    print_warning ".env already exists. Skipping environment setup."
fi

# Set proper permissions
print_status "Setting file permissions..."
chmod 600 config/secure/panel-configs.json
if [ -f ".env" ]; then
    chmod 600 .env
fi

# Test configuration
print_status "Testing configuration..."
if node dist/scripts/test-json-config.js; then
    print_status "Configuration test passed! ✅"
else
    print_error "Configuration test failed! ❌"
    print_error "Please check your configuration and try again."
    exit 1
fi

# Final instructions
echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Edit config/secure/panel-configs.json with your panel details"
echo "2. Update .env with your sensitive credentials (recommended)"
echo "3. Update your application code to use the new service:"
echo "   import { getActivePanelConfig } from './services/panelConfig.service.json'"
echo "4. Test your application: npm run dev"
echo ""
echo "For detailed instructions, see:"
echo "- config/PANEL_CONFIG_MANAGEMENT.md"
echo "- DEPLOYMENT_GUIDE.md"
echo ""
echo "Security reminders:"
echo "- Never commit config/secure/panel-configs.json to version control"
echo "- Use environment variables for sensitive data"
echo "- Keep your configuration files secure"

print_status "Setup complete! 🚀"
