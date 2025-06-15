import * as fs from "fs";
import * as path from "path";

export interface PanelConfigData {
  id: string;
  username: string;
  password: string;
  baseUrl: string;
  isActive: boolean;
  priority: number;
  isHealthy: boolean;
  description: string;
}

export interface PanelConfigSettings {
  healthCheckInterval: number;
  maxRetries: number;
  connectionTimeout: number;
}

export interface PanelConfigFile {
  panelConfigs: PanelConfigData[];
  settings: PanelConfigSettings;
}

class ConfigLoader {
  private static instance: ConfigLoader;
  private config: PanelConfigFile | null = null;
  private configPath: string;

  private constructor() {
    this.configPath = path.join(
      __dirname,
      "../config/secure/panel-configs.json"
    );
  }

  public static getInstance(): ConfigLoader {
    if (!ConfigLoader.instance) {
      ConfigLoader.instance = new ConfigLoader();
    }
    return ConfigLoader.instance;
  }

  private loadConfig(): PanelConfigFile {
    if (this.config) {
      return this.config;
    }

    try {
      if (!fs.existsSync(this.configPath)) {
        throw new Error(`Panel config file not found at: ${this.configPath}`);
      }

      const configContent = fs.readFileSync(this.configPath, "utf8");
      const rawConfig = JSON.parse(configContent) as PanelConfigFile;

      // Replace environment variable placeholders with actual values
      this.config = this.processEnvironmentVariables(rawConfig);

      return this.config;
    } catch (error) {
      console.error("Failed to load panel configuration:", error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to load panel configuration: ${errorMessage}`);
    }
  }

  private processEnvironmentVariables(
    config: PanelConfigFile
  ): PanelConfigFile {
    const processedConfig = { ...config };

    processedConfig.panelConfigs = config.panelConfigs.map((panel) => ({
      ...panel,
      username: this.resolveEnvVar(panel.username),
      password: this.resolveEnvVar(panel.password),
      baseUrl: this.resolveEnvVar(panel.baseUrl),
    }));

    return processedConfig;
  }

  private resolveEnvVar(value: string): string {
    // If value looks like an environment variable (starts with uppercase and underscore)
    if (value.match(/^[A-Z][A-Z_0-9]*$/)) {
      const envValue = process.env[value];
      if (!envValue) {
        console.warn(
          `Environment variable ${value} not found, using original value`
        );
        return value;
      }
      return envValue;
    }
    return value;
  }

  public getPanelConfigs(): PanelConfigData[] {
    const config = this.loadConfig();
    return config.panelConfigs;
  }

  public getSettings(): PanelConfigSettings {
    const config = this.loadConfig();
    return config.settings;
  }

  public getActivePanelConfigs(): PanelConfigData[] {
    return this.getPanelConfigs().filter(
      (panel) => panel.isActive && panel.isHealthy
    );
  }

  public getPanelConfigById(id: string): PanelConfigData | null {
    const configs = this.getPanelConfigs();
    return configs.find((config) => config.id === id) || null;
  }

  public getPanelConfigByBaseUrl(baseUrl: string): PanelConfigData | null {
    const configs = this.getPanelConfigs();
    return configs.find((config) => config.baseUrl.includes(baseUrl)) || null;
  }

  public getOptimalPanelConfig(): PanelConfigData | null {
    const activeConfigs = this.getActivePanelConfigs();

    if (activeConfigs.length === 0) {
      return null;
    }

    // Sort by priority (highest first), then by id for consistency
    activeConfigs.sort((a, b) => {
      if (b.priority !== a.priority) {
        return b.priority - a.priority;
      }
      return a.id.localeCompare(b.id);
    });

    return activeConfigs[0];
  }

  public reloadConfig(): void {
    this.config = null;
    this.loadConfig();
  }

  public updatePanelHealth(id: string, isHealthy: boolean): boolean {
    const config = this.loadConfig();
    const panel = config.panelConfigs.find((p) => p.id === id);

    if (panel) {
      panel.isHealthy = isHealthy;
      // Note: This only updates in-memory config, not the file
      // For persistent updates, you'd need to implement file writing
      return true;
    }

    return false;
  }
}

export const configLoader = ConfigLoader.getInstance();
export default configLoader;
