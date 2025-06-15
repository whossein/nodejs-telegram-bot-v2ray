// LEGACY FILE - This file is kept for reference during migration
// Use ../sequelize/models.ts for new Sequelize models

/*
import { Schema, model, Document } from 'mongoose';

export interface IPanelConfig extends Document {
  id: Schema.Types.ObjectId;
  username: string;
  password: string;
  baseUrl: string;
  token?: string;
  isActive?: boolean;
  priority?: number; // Higher number = higher priority
  maxConnections?: number; // Optional: limit connections per panel
  currentConnections?: number; // Track current usage
  lastHealthCheck?: Date;
  isHealthy?: boolean;
  description?: string;
}

const PanelConfigSchema = new Schema<IPanelConfig>(
  {
    id: {
      type: Schema.Types.ObjectId,
      auto: true,
    },
    username: { type: String, required: true },
    password: { type: String, required: true },
    baseUrl: { type: String, required: true },
    token: { type: String, required: false },
    isActive: { type: Boolean, default: true },
    priority: { type: Number, default: 1 },
    maxConnections: { type: Number, required: false },
    currentConnections: { type: Number, default: 0 },
    lastHealthCheck: { type: Date, required: false },
    isHealthy: { type: Boolean, default: true },
    description: { type: String, required: false },
  },
  { timestamps: true },
);

const PanelConfig = model<IPanelConfig>('PanelConfig', PanelConfigSchema);

export default PanelConfig;
*/

// MIGRATION NOTE: Use the new Sequelize models from ../sequelize/models.ts
// This file is commented out to prevent import errors during migration
