const devModes = {
  DEVELOPMENT: "development",
  PRODUCTION: "production",
};
export const isTestEnv = process.env.DEV_MODE === devModes.DEVELOPMENT;

export const botToken = "6291644750:AAFBLJOkGRYq4o44pt1fiRfvXMQWbfwX7dw";

export const inLocal = true;
export const needTelegramBot = false;

export const storagePath = inLocal ? "./x.db" : "/etc/x-ui/x-ui.db";
