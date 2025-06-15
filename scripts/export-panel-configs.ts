import * as fs from "fs";
import * as path from "path";
import { PanelConfig, initializeDatabase } from "../sequelize/models";
import { PanelConfigFile } from "../utils/configLoader";

/**
 * Migration script to export existing panel configurations from database to JSON
 */

export async function exportPanelConfigsToJSON(): Promise<void> {
  try {
    console.log("Exporting panel configurations from database to JSON...");

    // Initialize database connection
    await initializeDatabase();

    // Fetch all panel configs from database
    const panelConfigs = await PanelConfig.findAll({
      order: [
        ["priority", "DESC"],
        ["id", "ASC"],
      ],
    });

    if (panelConfigs.length === 0) {
      console.log("No panel configurations found in database.");
      return;
    }

    // Convert database records to JSON format
    const jsonConfig: PanelConfigFile = {
      panelConfigs: panelConfigs.map((config, index) => ({
        id: `panel_${config.id || index + 1}`,
        username: config.username,
        password: config.password,
        baseUrl: config.baseUrl,
        isActive: config.isActive ?? true,
        priority: config.priority ?? 1,
        isHealthy: config.isHealthy !== false, // Default to true if null/undefined
        description: config.description || `Panel ${index + 1}`,
      })),
      settings: {
        healthCheckInterval: 300000, // 5 minutes
        maxRetries: 3,
        connectionTimeout: 30000, // 30 seconds
      },
    };

    // Create secure config directory if it doesn't exist
    const configDir = path.join(__dirname, "../config/secure");
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    // Write to JSON file
    const configPath = path.join(configDir, "panel-configs.json");
    const backupPath = path.join(
      configDir,
      `panel-configs.backup.${Date.now()}.json`
    );

    // Create backup if file already exists
    if (fs.existsSync(configPath)) {
      fs.copyFileSync(configPath, backupPath);
      console.log(`Existing config backed up to: ${backupPath}`);
    }

    // Write new configuration
    fs.writeFileSync(configPath, JSON.stringify(jsonConfig, null, 2));
    console.log(`Panel configurations exported to: ${configPath}`);

    // Also create a template with environment variables
    const templateConfig: PanelConfigFile = {
      panelConfigs: jsonConfig.panelConfigs.map((config, index) => ({
        ...config,
        username: `PANEL_${index + 1}_USERNAME`,
        password: `PANEL_${index + 1}_PASSWORD`,
        baseUrl: `PANEL_${index + 1}_BASE_URL`,
      })),
      settings: jsonConfig.settings,
    };

    const templatePath = path.join(configDir, "panel-configs.template.json");
    fs.writeFileSync(templatePath, JSON.stringify(templateConfig, null, 2));
    console.log(`Template configuration created at: ${templatePath}`);

    // Generate .env template
    const envTemplate = jsonConfig.panelConfigs
      .map((config, index) => {
        return [
          `# Panel ${index + 1} Configuration`,
          `PANEL_${index + 1}_USERNAME=${config.username}`,
          `PANEL_${index + 1}_PASSWORD=${config.password}`,
          `PANEL_${index + 1}_BASE_URL=${config.baseUrl}`,
          "",
        ].join("\n");
      })
      .join("\n");

    const envPath = path.join(__dirname, "../.env.template");
    fs.writeFileSync(envPath, envTemplate);
    console.log(`Environment template created at: ${envPath}`);

    console.log(
      `\nSuccessfully exported ${jsonConfig.panelConfigs.length} panel configurations!`
    );
    console.log("\nNext steps:");
    console.log("1. Review the generated configuration files");
    console.log("2. Update your service imports to use the JSON-based service");
    console.log("3. Test the new configuration");
    console.log(
      "4. Remove database-based seeding if everything works correctly"
    );
  } catch (error) {
    console.error("Failed to export panel configurations:", error);
    throw error;
  }
}

// Run export if called directly
if (require.main === module) {
  exportPanelConfigsToJSON()
    .then(() => {
      console.log("Export completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Export failed:", error);
      process.exit(1);
    });
}
