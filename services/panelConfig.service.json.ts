import { configLoader, PanelConfigData } from "../utils/configLoader";

// Compatibility interface to match existing database model
export interface PanelConfigModel {
  id?: number;
  username: string;
  password: string;
  baseUrl: string;
  isActive: boolean;
  priority: number;
  isHealthy: boolean;
  description: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Convert from JSON config format to database model format
function convertToModel(config: PanelConfigData): PanelConfigModel {
  return {
    username: config.username,
    password: config.password,
    baseUrl: config.baseUrl,
    isActive: config.isActive,
    priority: config.priority,
    isHealthy: config.isHealthy,
    description: config.description,
  };
}

export async function createPanelConfig(
  data: Partial<PanelConfigModel>
): Promise<PanelConfigModel> {
  // For JSON-based config, this would require file modification
  // For now, throw an error to indicate this operation isn't supported
  throw new Error(
    "Creating panel configs is not supported with JSON-based configuration. Please edit the config file directly."
  );
}

export async function getPanelConfigByBaseUrl(
  baseUrl: string
): Promise<PanelConfigModel | null> {
  try {
    const config = configLoader.getPanelConfigByBaseUrl(baseUrl);
    return config ? convertToModel(config) : null;
  } catch (error) {
    console.error("Error getting panel config by base URL:", error);
    return null;
  }
}

export async function getActivePanelConfig(): Promise<PanelConfigModel | null> {
  try {
    const config = configLoader.getOptimalPanelConfig();
    return config ? convertToModel(config) : null;
  } catch (error) {
    console.error("Error getting active panel config:", error);
    return null;
  }
}

export async function getAllPanelConfigs(): Promise<PanelConfigModel[]> {
  try {
    const configs = configLoader.getPanelConfigs();
    return configs.map(convertToModel);
  } catch (error) {
    console.error("Error getting all panel configs:", error);
    return [];
  }
}

export async function getPanelConfigById(
  id: number
): Promise<PanelConfigModel | null> {
  try {
    // Convert number ID to string for JSON config
    const config = configLoader.getPanelConfigById(`panel_${id}`);
    return config ? convertToModel(config) : null;
  } catch (error) {
    console.error("Error getting panel config by ID:", error);
    return null;
  }
}

export async function updatePanelConfig(
  id: number,
  updateData: Partial<PanelConfigModel>
): Promise<PanelConfigModel | null> {
  // For JSON-based config, this would require file modification
  // For now, we can only update health status in memory
  if (updateData.hasOwnProperty("isHealthy")) {
    const success = configLoader.updatePanelHealth(
      `panel_${id}`,
      updateData.isHealthy!
    );
    if (success) {
      return getPanelConfigById(id);
    }
  }

  console.warn(
    "Only health status updates are supported in JSON-based configuration. For other updates, please edit the config file directly."
  );
  return null;
}

export async function deletePanelConfig(id: number): Promise<boolean> {
  // For JSON-based config, this would require file modification
  throw new Error(
    "Deleting panel configs is not supported with JSON-based configuration. Please edit the config file directly."
  );
}

// Advanced selection with load balancing
export async function selectOptimalPanel(): Promise<PanelConfigModel | null> {
  try {
    const config = configLoader.getOptimalPanelConfig();
    return config ? convertToModel(config) : null;
  } catch (error) {
    console.error("Error selecting optimal panel:", error);
    return null;
  }
}

// Additional utility functions for JSON-based config
export function reloadPanelConfigs(): void {
  configLoader.reloadConfig();
}

export function getPanelConfigSettings() {
  return configLoader.getSettings();
}

export async function getActivePanelConfigs(): Promise<PanelConfigModel[]> {
  try {
    const configs = configLoader.getActivePanelConfigs();
    return configs.map(convertToModel);
  } catch (error) {
    console.error("Error getting active panel configs:", error);
    return [];
  }
}
