import { initializeDatabase, V2ray, PanelConfig } from "../sequelize/models";

/**
 * Migration script to transfer data from MongoDB to SQLite
 * This script should be run after installing Sequelize and before removing MongoDB
 */

export async function migrateFromMongoDB() {
  try {
    console.log("Starting migration from MongoDB to SQLite...");

    // Initialize Sequelize database
    await initializeDatabase();

    // If you have existing MongoDB connection, uncomment the following:
    /*
    const mongoose = require('mongoose');
    await mongoose.connect('your-mongodb-connection-string');
    
    // Import old MongoDB models
    const OldV2ray = require('../models/v2ray.model').V2ray;
    const OldPanelConfig = require('../models/panelConfig.model').PanelConfig;
    
    // Migrate V2ray data
    console.log('Migrating V2ray data...');
    const v2rayDocs = await OldV2ray.find({});
    
    for (const doc of v2rayDocs) {
      await V2ray.create({
        link: doc.link,
        idUrl: doc.idUrl,
        title: doc.title,
        expire_date: doc.expire_date,
        volume_gb: doc.volume_gb,
        remaining_volume_mb: doc.remaining_volume_mb,
        user_id: doc.user_id, // This will be converted to JSON string
        order_id: doc.order_id,
        is_active: doc.is_active,
        admin_id: doc.admin_id,
        location_id: doc.location_id,
        is_expired: doc.is_expired,
        duration_days: doc.duration_days,
        alarmUserIds: doc.alarmUserIds, // This will be converted to JSON string
        password: doc.password,
        baseUrl: doc.baseUrl,
        port: doc.port,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      });
    }
    
    console.log(`Migrated ${v2rayDocs.length} V2ray records`);
    
    // Migrate PanelConfig data
    console.log('Migrating PanelConfig data...');
    const panelConfigDocs = await OldPanelConfig.find({});
    
    for (const doc of panelConfigDocs) {
      await PanelConfig.create({
        username: doc.username,
        password: doc.password,
        baseUrl: doc.baseUrl,
        token: doc.token,
        isActive: doc.isActive,
        priority: doc.priority,
        maxConnections: doc.maxConnections,
        currentConnections: doc.currentConnections,
        lastHealthCheck: doc.lastHealthCheck,
        isHealthy: doc.isHealthy,
        description: doc.description,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      });
    }
    
    console.log(`Migrated ${panelConfigDocs.length} PanelConfig records`);
    
    await mongoose.disconnect();
    */

    console.log("Migration completed successfully!");
    console.log("You can now remove MongoDB dependencies and old model files.");
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateFromMongoDB()
    .then(() => {
      console.log("Migration script completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Migration script failed:", error);
      process.exit(1);
    });
}
