const devModes = {
  DEVELOPMENT: "development",
  PRODUCTION: "production",
};
export const isTestEnv = process.env.DEV_MODE === devModes.DEVELOPMENT;

export const UserType = {
  Banned: "Banned",
  Normal: "Normal",
  NormalHamkar: "Normal_Hamkar",
  Admin: "Admin",
  Test: "Test",
};
