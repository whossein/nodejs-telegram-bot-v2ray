# Panel Configuration Setup

## Overview

The application now includes automatic seeding of initial panel configurations. When the application starts, it will automatically create the initial panel configurations if they don't already exist.

## Initial Panel Configurations

The following panel configurations are automatically seeded:

1. **Primary Panel Configuration**

   - URL: `https://vvv.netbros.ir:8443/gfmA`
   - Username: `admin`
   - Password: `Merlin1994`
   - Priority: 1
   - Status: Active & Healthy

2. **Secondary Panel Configuration**

   - URL: `https://bbb.netbros.ir:8443/Dk3b`
   - Username: `admin`
   - Password: `Merlin1994`
   - Priority: 2
   - Status: Active & Healthy

3. **Tertiary Panel Configuration**
   - URL: `https://ggg.netbros.ir:8443/Vdyk/`
   - Username: `admin`
   - Password: `Merlin1994`
   - Priority: 3
   - Status: Active & Healthy

## Available Scripts

### Seed Data Manually

```bash
npm run seed
```

This will populate the database with initial panel configurations if they don't already exist.

### Test Panel Configurations

```bash
npm run test:panels
```

This will display all panel configurations and show which one is currently active (highest priority).

### Initialize Database

```bash
npm run db:init
```

This will initialize the database and automatically seed the initial data.

## Automatic Seeding

The seeding happens automatically when:

1. The application starts normally
2. The database is initialized via `initializeDatabase()` function

The seeding is safe and will:

- Only create data if no panel configurations exist
- Skip seeding if configurations already exist
- Log the seeding process for debugging

## Database Schema

Panel configurations are stored in the `panel_configs` table with the following fields:

- `id` - Auto-incrementing primary key
- `username` - Authentication username
- `password` - Authentication password
- `baseUrl` - Panel base URL
- `token` - Optional authentication token
- `isActive` - Whether the panel is active (default: true)
- `priority` - Panel priority (higher number = higher priority)
- `maxConnections` - Optional connection limit
- `currentConnections` - Current connection count
- `lastHealthCheck` - Last health check timestamp
- `isHealthy` - Health status (default: true)
- `description` - Panel description
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

## Service Functions

The following service functions are available in `services/panelConfig.service.ts`:

- `getAllPanelConfigs()` - Get all panel configurations
- `getActivePanelConfig()` - Get the active panel with highest priority
- `getPanelConfigById(id)` - Get panel by ID
- `getPanelConfigByBaseUrl(baseUrl)` - Get panel by base URL
- `createPanelConfig(data)` - Create new panel configuration
