import { configLoader } from "../utils/configLoader";
import * as panelService from "../services/panelConfig.service.json";

/**
 * Test script for JSON-based panel configuration
 */

async function testPanelConfig(): Promise<void> {
  try {
    console.log("=== Testing JSON-based Panel Configuration ===\n");

    // Test 1: Load all configs
    console.log("1. Loading all panel configurations...");
    const allConfigs = await panelService.getAllPanelConfigs();
    console.log(`Found ${allConfigs.length} panel configurations:`);
    allConfigs.forEach((config) => {
      console.log(
        `  - ${config.description}: ${config.baseUrl} (Priority: ${config.priority}, Active: ${config.isActive})`
      );
    });

    // Test 2: Get active config
    console.log("\n2. Getting active panel configuration...");
    const activeConfig = await panelService.getActivePanelConfig();
    if (activeConfig) {
      console.log(
        `Active panel: ${activeConfig.baseUrl} (Priority: ${activeConfig.priority})`
      );
    } else {
      console.log("No active panel configuration found!");
    }

    // Test 3: Get optimal panel
    console.log("\n3. Selecting optimal panel...");
    const optimalPanel = await panelService.selectOptimalPanel();
    if (optimalPanel) {
      console.log(
        `Optimal panel: ${optimalPanel.baseUrl} (Priority: ${optimalPanel.priority})`
      );
    } else {
      console.log("No optimal panel found!");
    }

    // Test 4: Search by base URL
    console.log("\n4. Testing base URL search...");
    const testUrl = "netbros.ir";
    const foundConfig = await panelService.getPanelConfigByBaseUrl(testUrl);
    if (foundConfig) {
      console.log(`Found config for '${testUrl}': ${foundConfig.baseUrl}`);
    } else {
      console.log(`No config found for '${testUrl}'`);
    }

    // Test 5: Get settings
    console.log("\n5. Loading configuration settings...");
    const settings = panelService.getPanelConfigSettings();
    console.log(`Settings:`, JSON.stringify(settings, null, 2));

    // Test 6: Get active panels only
    console.log("\n6. Getting only active panels...");
    const activeConfigs = await panelService.getActivePanelConfigs();
    console.log(`Found ${activeConfigs.length} active panel configurations`);

    // Test 7: Test health update (in-memory only)
    console.log("\n7. Testing health status update...");
    const updateResult = await panelService.updatePanelConfig(1, {
      isHealthy: false,
    });
    if (updateResult) {
      console.log("Health status updated successfully");

      // Check if it affects active selection
      const newActiveConfig = await panelService.getActivePanelConfig();
      if (newActiveConfig) {
        console.log(
          `New active panel after health update: ${newActiveConfig.baseUrl}`
        );
      } else {
        console.log("No active panel after health update!");
      }
    }

    console.log("\n=== All tests completed successfully! ===");
  } catch (error) {
    console.error("Test failed:", error);
    throw error;
  }
}

// Run test if called directly
if (require.main === module) {
  testPanelConfig()
    .then(() => {
      console.log("\nTest completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\nTest failed:", error);
      process.exit(1);
    });
}

export { testPanelConfig };
