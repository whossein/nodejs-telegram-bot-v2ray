import {
  Sequelize,
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import { storagePath } from "../config/constant";

export const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: storagePath,
});

// Inbound Model Interface
export interface InboundModel
  extends Model<
    InferAttributes<InboundModel>,
    InferCreationAttributes<InboundModel>
  > {
  id: CreationOptional<number>;
  user_id: number;
  up: number;
  down: number;
  total: number;
  remark: string;
  enable: boolean;
  expiry_time: number;
  expiryTime: number;
  listen: string;
  port: number;
  protocol: string;
  settings:
    | string
    | {
        client: {
          password: string;
          email: string;
          flow: string;
          total: number;
        }[];
        fallbacks: [];
      };
  stream_settings: any;
  tag: string;
  sniffing: any;
}

// V2Ray Model Interface
export interface V2rayModel
  extends Model<
    InferAttributes<V2rayModel>,
    InferCreationAttributes<V2rayModel>
  > {
  id: CreationOptional<number>;
  link: string;
  idUrl: string;
  title?: string;
  expire_date: Date;
  volume_gb: number;
  remaining_volume_mb: number;
  user_id: string; // JSON array as string
  order_id?: string;
  is_active: boolean;
  admin_id?: string;
  location_id?: number;
  is_expired?: boolean;
  duration_days?: number;
  alarmUserIds?: string; // JSON array as string
  password: string;
  baseUrl: string;
  port: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// PanelConfig Model Interface
export interface PanelConfigModel
  extends Model<
    InferAttributes<PanelConfigModel>,
    InferCreationAttributes<PanelConfigModel>
  > {
  id: CreationOptional<number>;
  username: string;
  password: string;
  baseUrl: string;
  token?: string;
  isActive?: boolean;
  priority?: number;
  maxConnections?: number;
  currentConnections?: number;
  lastHealthCheck?: Date;
  isHealthy?: boolean;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Define Inbounds Model
export const Inbounds = sequelize.define<InboundModel>(
  "inbounds",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    up: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    down: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    total: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    remark: DataTypes.STRING,
    enable: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    expiry_time: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    expiryTime: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    listen: {
      type: DataTypes.TEXT,
    },
    port: {
      type: DataTypes.INTEGER,
      unique: true,
      allowNull: false,
    },
    protocol: DataTypes.STRING,
    settings: DataTypes.JSON,
    stream_settings: DataTypes.JSON,
    tag: {
      type: DataTypes.TEXT,
      unique: true,
    },
    sniffing: DataTypes.JSON,
  },
  { timestamps: false }
);

// Define V2Ray Model
export const V2ray = sequelize.define<V2rayModel>(
  "v2rays",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    link: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    idUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    expire_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    volume_gb: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    remaining_volume_mb: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    user_id: {
      type: DataTypes.TEXT, // Store as JSON string
      allowNull: false,
      get() {
        const rawValue = this.getDataValue("user_id");
        return rawValue ? JSON.parse(rawValue) : [];
      },
      set(value: string[]) {
        this.setDataValue("user_id", JSON.stringify(value));
      },
    },
    order_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    admin_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    location_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    is_expired: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    duration_days: {
      type: DataTypes.INTEGER,
      defaultValue: 180,
    },
    alarmUserIds: {
      type: DataTypes.TEXT, // Store as JSON string
      allowNull: true,
      get() {
        const rawValue = this.getDataValue("alarmUserIds");
        return rawValue ? JSON.parse(rawValue) : [];
      },
      set(value: string[]) {
        this.setDataValue("alarmUserIds", JSON.stringify(value || []));
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    baseUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    port: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: true,
    tableName: "v2rays",
  }
);

// Define PanelConfig Model
export const PanelConfig = sequelize.define<PanelConfigModel>(
  "panel_configs",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    baseUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    token: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    priority: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    maxConnections: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    currentConnections: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    lastHealthCheck: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    isHealthy: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    tableName: "panel_configs",
  }
);

// Initialize database connection and sync tables
export async function initializeDatabase(): Promise<void> {
  try {
    // Test the connection
    await sequelize.authenticate();
    console.log("Database connection established successfully.");

    // For development, use { force: false, alter: false } to avoid conflicts
    // For fresh installation, you can use { force: true } to recreate tables
    await sequelize.sync({
      force: false, // Don't drop existing tables
      alter: false, // Don't alter existing table structure to avoid conflicts
    });
    console.log("All models were synchronized successfully.");

    // Seed initial data
    await seedInitialData();
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    throw error;
  }
}

// Seed initial data
async function seedInitialData(): Promise<void> {
  try {
    // Check if any panel configs already exist
    const existingConfigs = await PanelConfig.findAll();

    if (existingConfigs.length > 0) {
      console.log(
        `Found ${existingConfigs.length} existing panel configurations. Skipping seed.`
      );
      return;
    }

    console.log("Seeding initial panel configurations...");

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

    // Create initial panel configurations
    for (const config of initialPanelConfigs) {
      await PanelConfig.create(config);
      console.log(`Created panel config: ${config.baseUrl}`);
    }

    console.log(
      `Successfully seeded ${initialPanelConfigs.length} panel configurations.`
    );
  } catch (error) {
    console.error("Failed to seed initial data:", error);
    // Don't throw the error to avoid breaking the application startup
    console.log("Application will continue without initial data seeding.");
  }
}

// Export models for easier imports
export { Inbounds as Inbound };
export default { sequelize, V2ray, PanelConfig, Inbounds, initializeDatabase };

// try {
//   sequelize.authenticate();
//   console.log("Connection DB");
// } catch (error) {
//   console.error("Unable to connect to the database:", error);
// }
