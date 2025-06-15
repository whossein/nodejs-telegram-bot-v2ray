// Export all Sequelize models and types
export * from "../sequelize/models";
export { sequelize } from "../sequelize/models";

// Keep legacy types for compatibility during migration
export type { InboundModel as InboundModelType } from "../sequelize/models";
export type { V2rayModel as IV2ray } from "../sequelize/models";
export type { PanelConfigModel as IPanelConfig } from "../sequelize/models";
