# JSON Panel Configuration Deployment Guide

This guide explains how to deploy the new JSON-based panel configuration system.

## Quick Start

### 1. Run the Migration Script

```bash
# Export existing database configs to JSON
npm run build
node dist/scripts/export-panel-configs.js
```

### 2. Update Your Environment

```bash
# Copy the generated environment template
cp .env.template .env

# Edit with your actual values
nano .env
```

### 3. Test the Configuration

```bash
# Test the JSON configuration
node dist/scripts/test-json-config.js
```

### 4. Update Service Imports

Replace imports in your files:

**Before:**

```typescript
import { getActivePanelConfig } from "../services/panelConfig.service";
```

**After:**

```typescript
import { getActivePanelConfig } from "../services/panelConfig.service.json";
```

Or use the service index:

```typescript
import { PanelConfigService } from "../services";
// PanelConfigService now points to the JSON-based service
```

## Detailed Deployment Steps

### Step 1: Backup Current Configuration

```bash
# Backup your database
cp x-ui.db x-ui.db.backup.$(date +%Y%m%d_%H%M%S)

# Export current config
npm run build
node dist/scripts/export-panel-configs.js
```

### Step 2: Verify JSON Configuration

Check the generated files:

```bash
# Review the generated configuration
cat config/secure/panel-configs.json

# Review the template (for version control)
cat config/secure/panel-configs.template.json

# Review environment template
cat .env.template
```

### Step 3: Set Up Environment Variables (Recommended)

```bash
# Copy template
cp .env.template .env

# Edit with your values
# For security, use environment variables for sensitive data
nano .env
```

Example `.env`:

```bash
# Panel 1 Configuration
PANEL_1_USERNAME=admin
PANEL_1_PASSWORD=your_secure_password_1
PANEL_1_BASE_URL=https://panel1.example.com:8443/path

# Panel 2 Configuration
PANEL_2_USERNAME=admin
PANEL_2_PASSWORD=your_secure_password_2
PANEL_2_BASE_URL=https://panel2.example.com:8443/path
```

### Step 4: Update Configuration File

If using environment variables, update `config/secure/panel-configs.json`:

```json
{
  "panelConfigs": [
    {
      "id": "panel_1",
      "username": "PANEL_1_USERNAME",
      "password": "PANEL_1_PASSWORD",
      "baseUrl": "PANEL_1_BASE_URL",
      "isActive": true,
      "priority": 3,
      "isHealthy": true,
      "description": "Primary panel"
    }
  ]
}
```

### Step 5: Update Application Code

#### Option A: Gradual Migration

Keep both services available:

```typescript
// Use new JSON service
import * as jsonPanelService from "../services/panelConfig.service.json";

// Fallback to database service if needed
import * as dbPanelService from "../services/panelConfig.service";
```

#### Option B: Complete Migration

Update all imports:

```bash
# Find all files that import the old service
grep -r "panelConfig.service" --include="*.ts" --exclude-dir=node_modules .

# Update each file to use the new service
# Replace: "./panelConfig.service"
# With: "./panelConfig.service.json"
```

### Step 6: Test the Migration

```bash
# Build the project
npm run build

# Test JSON configuration
node dist/scripts/test-json-config.js

# Run your application in test mode
npm run dev
```

### Step 7: Update Your CI/CD Pipeline

Add to your deployment script:

```bash
# Ensure config file exists
if [ ! -f "config/secure/panel-configs.json" ]; then
    echo "Panel config file not found!"
    exit 1
fi

# Validate JSON syntax
cat config/secure/panel-configs.json | jq empty
```

## File Update Examples

### Update XUI Controller

```typescript
// File: controllers/xui.controller.ts
// Before:
import { getPanelConfigByBaseUrl } from "../services/panelConfig.service";

// After:
import { getPanelConfigByBaseUrl } from "../services/panelConfig.service.json";
```

### Update XUI Service

```typescript
// File: services/xui.service.ts
// Before:
import {
  getPanelConfigByBaseUrl,
  getAllPanelConfigs,
  getActivePanelConfig,
} from "./panelConfig.service";

// After:
import {
  getPanelConfigByBaseUrl,
  getAllPanelConfigs,
  getActivePanelConfig,
} from "./panelConfig.service.json";
```

## Production Considerations

### Security

1. **Never commit** `panel-configs.json` to version control
2. **Use environment variables** for sensitive data
3. **Set proper file permissions**: `chmod 600 config/secure/panel-configs.json`
4. **Consider encryption** for stored passwords

### Monitoring

1. **Health checks**: Monitor panel health and update `isHealthy` status
2. **Configuration validation**: Validate JSON on startup
3. **Logging**: Log configuration loading and errors

### Backup Strategy

```bash
# Backup configuration before changes
cp config/secure/panel-configs.json config/secure/panel-configs.backup.$(date +%Y%m%d_%H%M%S).json

# Automated backup script
#!/bin/bash
BACKUP_DIR="/secure/backups/panel-configs"
mkdir -p "$BACKUP_DIR"
cp config/secure/panel-configs.json "$BACKUP_DIR/panel-configs.$(date +%Y%m%d_%H%M%S).json"
```

## Rollback Plan

If you need to rollback to database-based configuration:

### 1. Revert Service Imports

```bash
# Change back to database service
# Replace: "./panelConfig.service.json"
# With: "./panelConfig.service"
```

### 2. Restore Database Seeding

```bash
# Run the database seeder
node dist/scripts/seed-data.js
```

### 3. Update Services Index

```typescript
// File: services/index.ts
export * as PanelConfigService from "./panelConfig.service";
```

## Troubleshooting

### Configuration Not Loading

```bash
# Check file permissions
ls -la config/secure/panel-configs.json

# Validate JSON syntax
cat config/secure/panel-configs.json | jq empty

# Check application logs
tail -f logs/application.log
```

### Environment Variables Not Working

```bash
# Check environment loading
node -e "console.log(process.env.PANEL_1_USERNAME)"

# Verify .env file location
ls -la .env

# Test environment loading in Node.js
node -e "require('dotenv').config(); console.log(process.env.PANEL_1_USERNAME)"
```

### Performance Issues

- Configuration is cached in memory after first load
- Use `reloadPanelConfigs()` to refresh from file
- Consider implementing file watching for automatic reloads

## Success Verification

After deployment, verify:

1. ✅ Application starts without errors
2. ✅ Panel configurations are loaded correctly
3. ✅ Active panel selection works
4. ✅ Environment variables are resolved
5. ✅ Configuration file is excluded from version control
6. ✅ All existing functionality works as expected

Run the test script to verify:

```bash
node dist/scripts/test-json-config.js
```

## Next Steps

1. **Remove database seeding** once everything is working
2. **Set up monitoring** for configuration changes
3. **Implement automated backups**
4. **Consider encryption** for production environments
5. **Update documentation** and team training
