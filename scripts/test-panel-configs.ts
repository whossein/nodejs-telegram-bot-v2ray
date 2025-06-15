#!/usr/bin/env node

import { initializeDatabase } from "../sequelize/models";
import {
  getAllPanelConfigs,
  getActivePanelConfig,
} from "../services/panelConfig.service";

async function testPanelConfigs() {
  try {
    console.log("Testing panel configurations...");

    // Initialize database
    await initializeDatabase();

    // Get all panel configs
    const allConfigs = await getAllPanelConfigs();
    console.log(`\nFound ${allConfigs.length} panel configurations:`);

    allConfigs.forEach((config, index) => {
      console.log(`${index + 1}. ${config.description || "No description"}`);
      console.log(`   URL: ${config.baseUrl}`);
      console.log(`   Username: ${config.username}`);
      console.log(`   Priority: ${config.priority}`);
      console.log(`   Active: ${config.isActive}`);
      console.log(`   Healthy: ${config.isHealthy}`);
      console.log(`   Created: ${config.createdAt}`);
      console.log("");
    });

    // Get the active panel config (highest priority)
    const activeConfig = await getActivePanelConfig();
    if (activeConfig) {
      console.log(`Active panel configuration (highest priority):`);
      console.log(`  ${activeConfig.description} - ${activeConfig.baseUrl}`);
      console.log(`  Priority: ${activeConfig.priority}`);
    } else {
      console.log("No active panel configuration found.");
    }

    console.log("\n✅ Panel configuration test completed successfully!");
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Run the test
testPanelConfigs()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
