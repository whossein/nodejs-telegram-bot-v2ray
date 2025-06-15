import { PanelConfig, initializeDatabase } from "../sequelize/models";

/**
 * Seed initial panel configuration data
 */

const initialPanelConfigs = [
  {
    username: "admin",
    password: "Merlin1994",
    baseUrl: "https://vvv.netbros.ir:8443/gfmA",
    isActive: true,
    priority: 1,
    isHealthy: true,
    description: "Primary panel configuration",
  },
  {
    username: "admin",
    password: "Merlin1994",
    baseUrl: "https://bbb.netbros.ir:8443/Dk3b",
    isActive: true,
    priority: 2,
    isHealthy: true,
    description: "Secondary panel configuration",
  },
  {
    username: "admin",
    password: "Merlin1994",
    baseUrl: "https://ggg.netbros.ir:8443/Vdyk/",
    isActive: true,
    priority: 3,
    isHealthy: true,
    description: "Tertiary panel configuration",
  },
];

export async function seedPanelConfigs(): Promise<void> {
  try {
    console.log("Seeding panel configurations...");

    // Check if any panel configs already exist
    const existingConfigs = await PanelConfig.findAll();

    if (existingConfigs.length > 0) {
      console.log(
        `Found ${existingConfigs.length} existing panel configurations. Skipping seed.`
      );
      return;
    }

    // Create initial panel configurations
    for (const config of initialPanelConfigs) {
      await PanelConfig.create(config);
      console.log(`Created panel config: ${config.baseUrl}`);
    }

    console.log(
      `Successfully seeded ${initialPanelConfigs.length} panel configurations.`
    );
  } catch (error) {
    console.error("Failed to seed panel configurations:", error);
    throw error;
  }
}

// Run seeding if called directly
if (require.main === module) {
  initializeDatabase()
    .then(() => seedPanelConfigs())
    .then(() => {
      console.log("Seeding completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Seeding failed:", error);
      process.exit(1);
    });
}
