# Migration from Mongoose to Sequelize

This project has been migrated from Mongoose (MongoDB) to Sequelize ORM (SQLite). This document outlines the changes made and how to work with the new setup.

## Changes Made

### 1. Database Models

- **Old**: Mongoose models in `models/` directory
- **New**: Sequelize models in `sequelize/models.ts`

### 2. Model Changes

- **V2ray Model**:

  - `user_id` is now stored as JSON string array
  - `alarmUserIds` is now stored as JSON string array
  - `expiryTime` → `expiry_time` (to match SQL naming conventions)
  - Auto-incremented `id` instead of MongoDB ObjectId

- **PanelConfig Model**:

  - Auto-incremented `id` instead of MongoDB ObjectId
  - All fields remain the same functionality

- **Inbound Model**:
  - `expiryTime` → `expiry_time`
  - Auto-incremented `id` instead of MongoDB ObjectId

### 3. Service Layer Changes

- **v2ray.service.ts**: Updated to use Sequelize queries

  - `findByIdAndUpdate()` → `update()` with `where` clause
  - MongoDB `$or` queries → Sequelize `Op.or`
  - Array handling for user_id field

- **panelConfig.service.ts**: Updated to use Sequelize queries

  - `findOne()` with MongoDB regex → `findOne()` with `Op.like`
  - `findByIdAndUpdate()` → `update()` with `where` clause
  - `findByIdAndDelete()` → `destroy()` with `where` clause

- **xui.service.ts**: Updated model imports and queries
  - `findOneAndUpdate()` → `upsert()`
  - Updated type handling for JSON arrays

### 4. Controllers

- Updated imports to use new Sequelize models
- Fixed type handling for date conversions and array fields

## Database Setup

The database is automatically initialized when the application starts. The SQLite database file will be created at the path specified in `config/constant.ts` (`storagePath`).

### Tables Created

1. `v2rays` - Stores V2ray configurations
2. `panel_configs` - Stores panel configurations
3. `inbounds` - Stores inbound configurations

## Migration from MongoDB

If you have existing MongoDB data, use the migration script:

```bash
npm run build
node dist/scripts/migrate-to-sequelize.js
```

**Note**: You'll need to uncomment and configure the MongoDB connection in the migration script.

## Key Differences

### Query Syntax

```typescript
// Old (Mongoose)
await V2ray.findOne({ user_id: { $in: [userId] } });
await V2ray.findByIdAndUpdate(id, data, { new: true });

// New (Sequelize)
await V2ray.findOne({ where: { user_id: { [Op.like]: `%${userId}%` } } });
await V2ray.update(data, { where: { id } });
```

### Array Handling

```typescript
// V2ray model automatically handles JSON arrays
const v2ray = await V2ray.create({
  user_id: ["user1", "user2"], // Automatically stored as JSON string
  alarmUserIds: ["alarm1"], // Automatically stored as JSON string
});

// Retrieved as JavaScript arrays
console.log(v2ray.user_id); // ['user1', 'user2']
```

### ID Handling

```typescript
// Old (MongoDB ObjectId)
const v2ray = await V2ray.findById(objectId);

// New (Auto-increment integer)
const v2ray = await V2ray.findByPk(1);
```

## Package Dependencies

### Removed

- `mongoose` (can be removed after migration)

### Already Included

- `sequelize`
- `sqlite3`

## Environment Variables

No new environment variables are required. The SQLite database path is configured in `config/constant.ts`.

## Benefits of Migration

1. **Simpler Deployment**: No need for MongoDB server
2. **Better TypeScript Integration**: Sequelize provides better type safety
3. **SQL Standardization**: Easier to migrate to other SQL databases later
4. **Embedded Database**: SQLite doesn't require separate server process
5. **ACID Compliance**: Better data consistency guarantees

## Troubleshooting

### Database Connection Issues

Check that the SQLite file path in `config/constant.ts` is writable.

### Migration Issues

If migration fails:

1. Check MongoDB connection string
2. Ensure all required fields are mapped correctly
3. Handle any data type mismatches manually

### Type Errors

If you encounter TypeScript errors:

1. Make sure to use `as any` for complex Sequelize operations temporarily
2. Update utility functions that depend on old model structure
3. Check that all imports are updated to use new models

## Development

The database will be automatically synced on application start in development mode. In production, consider using Sequelize migrations for better control.

```typescript
// Development (automatic sync)
await sequelize.sync({ alter: true });

// Production (use migrations)
await sequelize.sync({ force: false });
```
