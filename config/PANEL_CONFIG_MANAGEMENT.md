# Panel Configuration Management

This document explains how to manage panel configurations using the JSON-based configuration system.

## Overview

Panel configurations have been moved from database seeding to secure JSON files for better management, security, and version control.

## Configuration Structure

### File Location

- **Template**: `config/secure/panel-configs.template.json` (version controlled)
- **Actual Config**: `config/secure/panel-configs.json` (excluded from version control)

### Configuration Format

```json
{
  "panelConfigs": [
    {
      "id": "panel_1",
      "username": "admin_or_ENV_VAR_NAME",
      "password": "password_or_ENV_VAR_NAME",
      "baseUrl": "https://example.com:8443/path",
      "isActive": true,
      "priority": 1,
      "isHealthy": true,
      "description": "Description of this panel"
    }
  ],
  "settings": {
    "healthCheckInterval": 300000,
    "maxRetries": 3,
    "connectionTimeout": 30000
  }
}
```

## Security Features

### 1. Environment Variable Support

You can use environment variables for sensitive data:

```json
{
  "username": "PANEL_1_USERNAME",
  "password": "PANEL_1_PASSWORD",
  "baseUrl": "PANEL_1_BASE_URL"
}
```

Set these in your `.env` file:

```bash
PANEL_1_USERNAME=admin
PANEL_1_PASSWORD=your_secure_password
PANEL_1_BASE_URL=https://your-panel.com:8443/path
```

### 2. File Exclusion

- `panel-configs.json` is excluded from version control
- Only `panel-configs.template.json` is tracked (with placeholder values)

## Setup Instructions

### 1. Initial Setup

```bash
# Copy template to create your config
cp config/secure/panel-configs.template.json config/secure/panel-configs.json

# Edit with your actual values
nano config/secure/panel-configs.json
```

### 2. Using Environment Variables (Recommended)

```bash
# Create .env file
touch .env

# Add your sensitive values
echo "PANEL_1_USERNAME=your_username" >> .env
echo "PANEL_1_PASSWORD=your_password" >> .env
echo "PANEL_1_BASE_URL=https://your-panel.com:8443/path" >> .env
```

### 3. Configuration Properties

| Property      | Type    | Description                                      |
| ------------- | ------- | ------------------------------------------------ |
| `id`          | string  | Unique identifier for the panel                  |
| `username`    | string  | Username for panel access                        |
| `password`    | string  | Password for panel access                        |
| `baseUrl`     | string  | Full URL to the panel                            |
| `isActive`    | boolean | Whether this panel is active                     |
| `priority`    | number  | Priority for load balancing (higher = preferred) |
| `isHealthy`   | boolean | Health status of the panel                       |
| `description` | string  | Human-readable description                       |

## Management Operations

### Adding a New Panel

1. Edit `config/secure/panel-configs.json`
2. Add new panel object to `panelConfigs` array
3. Restart the application

### Modifying Existing Panel

1. Edit `config/secure/panel-configs.json`
2. Update the desired properties
3. Restart the application (or call `reloadPanelConfigs()`)

### Disabling a Panel

Set `isActive: false` or `isHealthy: false` in the configuration.

### Load Balancing

Panels are selected based on:

1. `isActive: true`
2. `isHealthy: true` (or not explicitly false)
3. Highest `priority` value
4. Consistent ordering by `id`

## API Compatibility

The service maintains compatibility with the existing database-based API:

```typescript
// These functions work the same as before
await getActivePanelConfig();
await getAllPanelConfigs();
await getPanelConfigByBaseUrl(url);
await selectOptimalPanel();

// New functions for JSON-based management
reloadPanelConfigs(); // Reload config from file
getPanelConfigSettings(); // Get settings section
```

## Migration Notes

### From Database Seeder

1. Existing seed data has been moved to JSON format
2. Database seeding is no longer needed for panel configs
3. Runtime panel health updates work in-memory only
4. Persistent changes require editing the JSON file

### Backup Strategy

- Keep `panel-configs.template.json` updated with structure changes
- Backup your `panel-configs.json` file separately
- Consider using encrypted storage for production environments

## Troubleshooting

### Config Not Loading

- Check file permissions on `config/secure/panel-configs.json`
- Verify JSON syntax with `cat config/secure/panel-configs.json | jq`
- Check application logs for config loading errors

### Environment Variables Not Working

- Ensure variable names match exactly (case-sensitive)
- Use format: `UPPERCASE_WITH_UNDERSCORES`
- Verify `.env` file is in project root

### Panel Selection Issues

- Check `isActive` and `isHealthy` values
- Verify `priority` numbers are set correctly
- Use `getAllPanelConfigs()` to debug current state

## Best Practices

1. **Security**: Use environment variables for sensitive data
2. **Backup**: Keep secure backups of your configuration
3. **Monitoring**: Implement health checks to update `isHealthy` status
4. **Testing**: Test configuration changes in staging first
5. **Documentation**: Update panel descriptions when making changes
